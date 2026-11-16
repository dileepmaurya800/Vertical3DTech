import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ShopifyCartPayload } from '../types/pricing';

export interface CartState {
  isCartModalOpen: boolean;
  isPdfModalOpen: boolean;
  isShareModalOpen: boolean;
  latestShopifyPayload: ShopifyCartPayload | null;
  capturedScreenshot: string | null;
  toastMessage: string | null;
}

const initialState: CartState = {
  isCartModalOpen: false,
  isPdfModalOpen: false,
  isShareModalOpen: false,
  latestShopifyPayload: null,
  capturedScreenshot: null,
  toastMessage: null,
};

export const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    setCartModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isCartModalOpen = action.payload;
    },
    setPdfModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isPdfModalOpen = action.payload;
    },
    setShareModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isShareModalOpen = action.payload;
    },
    setShopifyPayload: (state, action: PayloadAction<ShopifyCartPayload | null>) => {
      state.latestShopifyPayload = action.payload;
    },
    setCapturedScreenshot: (state, action: PayloadAction<string | null>) => {
      state.capturedScreenshot = action.payload;
    },
    setToastMessage: (state, action: PayloadAction<string | null>) => {
      state.toastMessage = action.payload;
    },
  },
});

export const {
  setCartModalOpen,
  setPdfModalOpen,
  setShareModalOpen,
  setShopifyPayload,
  setCapturedScreenshot,
  setToastMessage,
} = cartSlice.actions;

export default cartSlice.reducer;
