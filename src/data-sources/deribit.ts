
import { z } from 'zod';
import { DataSource } from './base';
import { OptionData } from '../types/global';
import { config } from '../utils/config';

// Zod Schemas for Deribit API responses
const InstrumentSchema = z.object({
  tick_size: z.number(),
  taker_commission: z.number(),
  strike: z.number(),
  settlement_period: z.string(),
  quote_currency: z.string(),
  price_index: z.string(),
  option_type: z.enum(['call', 'put']),
  min_trade_amount: z.number(),
  maker_commission: z.number(),
  kind: z.enum(['future', 'option']),
  is_active: z.boolean(),
  instrument_name: z.string(),
  expiration_timestamp: z.number(),
  creation_timestamp: z.number(),
  contract_size: z.number(),
  base_currency: z.string(),
});

const BookSummarySchema = z.object({
  volume_usd: z.number().nullable(),
  volume: z.number().nullable(),
  underlying_price: z.number().nullable(),
  underlying_index: z.string(),
  quote_currency: z.string(),
  price_change: z.number().nullable(),
  open_interest: z.number(),
  mid_price: z.number().nullable(),
  mark_price: z.number(),
  low: z.number().nullable(),
  last: z.number().nullable(),
  interest_rate: z.number(),
  instrument_name: z.string(),
  high: z.number().nullable(),
  funding_8h: z.number().nullable(),
  estimated_delivery_price: z.number().nullable(),
  current_funding: z.number().nullable(),
  creation_timestamp: z.number(),
  bid_price: z.number().nullable(),
  base_currency: z.string(),
  ask_price: z.number().nullable(),
  mark_iv: z.number(),
});

const IndexPriceSchema = z.object({
  index_price: z.number(),
  index_name: z.string(),
});

const ExpirationsSchema = z.array(z.number());

export class DeribitDataSource implements DataSource {
  private readonly apiUrl = config.deribit.apiUrl;

  async getOptionChain(symbol: string, expiration: string): Promise<OptionData[]> {
    const instruments = await this.fetchInstruments(symbol, 'option');
    const filteredInstruments = instruments.filter(
      (instrument) => instrument.instrument_name.includes(expiration)
    );

    const optionData: OptionData[] = [];
    for (const instrument of filteredInstruments) {
      const bookSummary = await this.fetchBookSummary(instrument.instrument_name);
      if (bookSummary) {
        optionData.push({
          strike: instrument.strike,
          type: instrument.option_type,
          impliedVolatility: bookSummary.mark_iv,
          volume: bookSummary.volume ?? 0,
          openInterest: bookSummary.open_interest,
          bidPrice: bookSummary.bid_price ?? 0,
          askPrice: bookSummary.ask_price ?? 0,
          lastPrice: bookSummary.last ?? 0,
          expiration: new Date(instrument.expiration_timestamp).toISOString(),
        });
      }
    }
    return optionData;
  }

  async getAvailableExpirations(symbol: string): Promise<string[]> {
    const response = await this.fetchFromApi(`/public/get_expirations?currency=${symbol}`);
    const expirations = ExpirationsSchema.parse(response.result);
    return expirations.map((exp) => new Date(exp).toISOString());
  }

  async getCurrentPrice(symbol: string): Promise<number> {
    const response = await this.fetchFromApi(`/public/get_index_price?index_name=${symbol.toLowerCase()}_usd`);
    const indexPrice = IndexPriceSchema.parse(response.result);
    return indexPrice.index_price;
  }

  private async fetchInstruments(currency: string, kind: 'option' | 'future') {
    const response = await this.fetchFromApi(`/public/get_instruments?currency=${currency}&kind=${kind}`);
    return z.array(InstrumentSchema).parse(response.result);
  }

  private async fetchBookSummary(instrumentName: string) {
    const response = await this.fetchFromApi(`/public/get_book_summary_by_instrument?instrument_name=${instrumentName}`);
    const result = z.array(BookSummarySchema).parse(response.result);
    return result[0] ?? null;
  }

  private async fetchFromApi(endpoint: string): Promise<any> {
    const response = await fetch(`${this.apiUrl}${endpoint}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch from Deribit API: ${response.statusText}`);
    }
    return response.json();
  }
}
