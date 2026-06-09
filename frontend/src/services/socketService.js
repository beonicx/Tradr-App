import { io } from 'socket.io-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import store from '../store';
import { updateLivePrice } from '../store/slices/marketSlice';
import { updateHoldingPrice } from '../store/slices/portfolioSlice';
import config from '../config/env';

const SOCKET_BASE_URL = config.socketUrl;

class SocketService {
  constructor() {
    this.socket = null;
    this.subscribedSymbols = new Set();
    this.listeners = new Map();
    this.isConnected = false;
  }

  async connect() {
    if (this.socket?.connected) return;
    const token = await AsyncStorage.getItem('accessToken');
    const userStr = await AsyncStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    this.socket = io(SOCKET_BASE_URL, {
      transports: ['websocket'],
      auth: { token },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });

    this.socket.on('connect', () => {
      this.isConnected = true;
      console.log('✅ Socket connected:', this.socket.id);
      if (user?.id) this.socket.emit('join_room', user.id);
      if (this.subscribedSymbols.size > 0) {
        this.socket.emit('subscribe_stock', Array.from(this.subscribedSymbols));
      }
    });

    this.socket.on('market_update', (data) => {
      store.dispatch(updateLivePrice(data));
      store.dispatch(updateHoldingPrice({ symbol: data.symbol, price: data.price }));
    });

    this.socket.on('disconnect', (reason) => {
      this.isConnected = false;
      console.log('Socket disconnected:', reason);
    });

    this.socket.on('connect_error', (err) => {
      console.error('Socket connect error:', err.message);
    });
  }

  subscribe(symbols) {
    const arr = Array.isArray(symbols) ? symbols : [symbols];
    arr.forEach((s) => this.subscribedSymbols.add(s.toUpperCase()));
    if (this.socket?.connected) {
      this.socket.emit('subscribe_stock', arr.map((s) => s.toUpperCase()));
    }
  }

  unsubscribe(symbols) {
    const arr = Array.isArray(symbols) ? symbols : [symbols];
    arr.forEach((s) => this.subscribedSymbols.delete(s.toUpperCase()));
    if (this.socket?.connected) {
      this.socket.emit('unsubscribe_stock', arr.map((s) => s.toUpperCase()));
    }
  }

  onStockTrade(symbol, cb) {
    const event = `trade_${symbol.toUpperCase()}`;
    this.socket?.on(event, cb);
    return () => this.socket?.off(event, cb);
  }

  onStockQuote(symbol, cb) {
    const event = `quote_${symbol.toUpperCase()}`;
    this.socket?.on(event, cb);
    return () => this.socket?.off(event, cb);
  }

  disconnect() {
    this.socket?.disconnect();
    this.socket = null;
    this.isConnected = false;
    this.subscribedSymbols.clear();
  }
}

export default new SocketService();
