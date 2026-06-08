const WebSocket = require('ws');
const axios = require('axios');

class PolygonService {
  constructor(io) {
    this.io = io;
    this.ws = null;
    this.subscribedSymbols = new Set();
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 1000;
    this.priceCache = new Map();
    this.isAuthenticated = false;
    this.BASE_URL = 'https://api.polygon.io';
    this.API_KEY = process.env.POLYGON_API_KEY;
  }

  initializeWebSocket() {
    if (!this.API_KEY) {
      console.warn('⚠️  Polygon API key not configured - skipping WebSocket');
      return;
    }

    try {
      this.ws = new WebSocket('wss://socket.polygon.io/stocks');

      this.ws.on('open', () => {
        console.log('✅ Polygon WebSocket connected');
        this.reconnectAttempts = 0;
        this.reconnectDelay = 1000;
        this.authenticate();
      });

      this.ws.on('message', (data) => {
        try {
          const messages = JSON.parse(data.toString());
          if (Array.isArray(messages)) {
            messages.forEach((msg) => this.handleMessage(msg));
          }
        } catch (err) {
          console.error('Polygon message parse error:', err);
        }
      });

      this.ws.on('close', (code, reason) => {
        this.isAuthenticated = false;
        console.log(`Polygon WS closed: ${code} - ${reason}`);
        this.scheduleReconnect();
      });

      this.ws.on('error', (error) => {
        console.error('Polygon WS error:', error.message);
      });
    } catch (err) {
      console.error('WebSocket init error:', err);
      this.scheduleReconnect();
    }
  }

  authenticate() {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ action: 'auth', params: this.API_KEY }));
    }
  }

  handleMessage(msg) {
    switch (msg.ev) {
      case 'status':
        if (msg.status === 'auth_success') {
          console.log('✅ Polygon authenticated');
          this.isAuthenticated = true;
          this.resubscribeAll();
        } else if (msg.status === 'auth_failed') {
          console.error('❌ Polygon auth failed:', msg.message);
        }
        break;
      case 'T':
        this.handleTradeUpdate(msg);
        break;
      case 'Q':
        this.handleQuoteUpdate(msg);
        break;
      case 'AM':
        this.handleAggregateUpdate(msg);
        break;
      default:
        break;
    }
  }

  handleTradeUpdate(msg) {
    const cached = this.priceCache.get(msg.sym);
    const data = {
      symbol: msg.sym,
      price: msg.p,
      size: msg.s,
      timestamp: msg.t,
      exchange: msg.x,
      prevClose: cached?.prevClose || msg.p,
      change: cached?.prevClose ? msg.p - cached.prevClose : 0,
      changePercent: cached?.prevClose
        ? ((msg.p - cached.prevClose) / cached.prevClose) * 100
        : 0,
    };
    this.priceCache.set(msg.sym, { ...data, prevClose: data.prevClose });
    if (this.io) {
      this.io.emit(`trade_${msg.sym}`, data);
      this.io.emit('market_update', data);
    }
  }

  handleQuoteUpdate(msg) {
    const data = {
      symbol: msg.sym,
      bidPrice: msg.bp,
      bidSize: msg.bs,
      askPrice: msg.ap,
      askSize: msg.as,
      timestamp: msg.t,
    };
    if (this.io) this.io.emit(`quote_${msg.sym}`, data);
  }

  handleAggregateUpdate(msg) {
    const data = {
      symbol: msg.sym,
      open: msg.o,
      high: msg.h,
      low: msg.l,
      close: msg.c,
      volume: msg.v,
      vwap: msg.vw,
      timestamp: msg.s,
    };
    if (this.io) this.io.emit(`aggregate_${msg.sym}`, data);
  }

  subscribeToSymbols(symbols, socket) {
    const arr = Array.isArray(symbols) ? symbols : [symbols];
    arr.forEach((symbol) => {
      const s = symbol.toUpperCase();
      if (!this.subscribedSymbols.has(s)) {
        this.subscribedSymbols.add(s);
        if (this.ws?.readyState === WebSocket.OPEN && this.isAuthenticated) {
          this.ws.send(
            JSON.stringify({
              action: 'subscribe',
              params: `T.${s},Q.${s},AM.${s}`,
            })
          );
        }
      }
      // Send cached price immediately
      if (socket && this.priceCache.has(s)) {
        socket.emit(`trade_${s}`, this.priceCache.get(s));
      }
    });
  }

  unsubscribeFromSymbols(symbols) {
    const arr = Array.isArray(symbols) ? symbols : [symbols];
    arr.forEach((symbol) => {
      const s = symbol.toUpperCase();
      this.subscribedSymbols.delete(s);
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(
          JSON.stringify({ action: 'unsubscribe', params: `T.${s},Q.${s},AM.${s}` })
        );
      }
    });
  }

  resubscribeAll() {
    if (this.subscribedSymbols.size > 0) {
      const params = Array.from(this.subscribedSymbols)
        .flatMap((s) => [`T.${s}`, `Q.${s}`, `AM.${s}`])
        .join(',');
      this.ws.send(JSON.stringify({ action: 'subscribe', params }));
    }
  }

  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(this.reconnectDelay * this.reconnectAttempts, 30000);
      console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);
      setTimeout(() => this.initializeWebSocket(), delay);
    } else {
      console.error('Max reconnect attempts reached');
    }
  }

  // REST API Methods
  async getStockDetails(symbol) {
    const res = await axios.get(`${this.BASE_URL}/v3/reference/tickers/${symbol.toUpperCase()}`, {
      params: { apiKey: this.API_KEY },
      timeout: 10000,
    });
    return res.data.results;
  }

  async getLastTrade(symbol) {
    const res = await axios.get(`${this.BASE_URL}/v2/last/trade/${symbol.toUpperCase()}`, {
      params: { apiKey: this.API_KEY },
      timeout: 10000,
    });
    return res.data.results;
  }

  async getAggregates(symbol, multiplier = 1, timespan = 'day', from, to) {
    const res = await axios.get(
      `${this.BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/range/${multiplier}/${timespan}/${from}/${to}`,
      {
        params: { apiKey: this.API_KEY, adjusted: true, sort: 'asc', limit: 500 },
        timeout: 15000,
      }
    );
    return res.data.results || [];
  }

  async searchTickers(query, limit = 20) {
    const res = await axios.get(`${this.BASE_URL}/v3/reference/tickers`, {
      params: { search: query, active: true, limit, apiKey: this.API_KEY },
      timeout: 10000,
    });
    return res.data.results || [];
  }

  async getMarketStatus() {
    const res = await axios.get(`${this.BASE_URL}/v1/marketstatus/now`, {
      params: { apiKey: this.API_KEY },
      timeout: 10000,
    });
    return res.data;
  }

  async getTickerSnapshot(symbol) {
    const res = await axios.get(
      `${this.BASE_URL}/v2/snapshot/locale/us/markets/stocks/tickers/${symbol.toUpperCase()}`,
      { params: { apiKey: this.API_KEY }, timeout: 10000 }
    );
    return res.data.ticker;
  }

  async getTopMovers() {
    const [gainersRes, losersRes] = await Promise.allSettled([
      axios.get(`${this.BASE_URL}/v2/snapshot/locale/us/markets/stocks/gainers`, {
        params: { apiKey: this.API_KEY },
        timeout: 10000,
      }),
      axios.get(`${this.BASE_URL}/v2/snapshot/locale/us/markets/stocks/losers`, {
        params: { apiKey: this.API_KEY },
        timeout: 10000,
      }),
    ]);

    return {
      gainers: gainersRes.status === 'fulfilled' ? gainersRes.value.data.tickers || [] : [],
      losers: losersRes.status === 'fulfilled' ? losersRes.value.data.tickers || [] : [],
    };
  }

  async getPreviousClose(symbol) {
    const res = await axios.get(
      `${this.BASE_URL}/v2/aggs/ticker/${symbol.toUpperCase()}/prev`,
      { params: { apiKey: this.API_KEY, adjusted: true }, timeout: 10000 }
    );
    return res.data.results?.[0] || null;
  }
}

module.exports = PolygonService;