
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
  funding_8h: z.number().nullable().optional(),
  estimated_delivery_price: z.number().nullable().optional(),
  current_funding: z.number().nullable().optional(),
  creation_timestamp: z.number(),
  bid_price: z.number().nullable(),
  base_currency: z.string(),
  ask_price: z.number().nullable(),
  mark_iv: z.number(),
});

const IndexPriceSchema = z.object({
  index_price: z.number(),
});

const ExpirationsSchema = z.record(z.string(), z.object({ option: z.array(z.string()), future: z.array(z.string()) }));

export class DeribitDataSource implements DataSource {
  private readonly apiUrl = config.deribit.apiUrl;
  private baseCurrency: string;
  private quoteCurrency: string;

  constructor(baseCurrency: string, quoteCurrency: string) {
    this.baseCurrency = baseCurrency;
    this.quoteCurrency = quoteCurrency;
  }

  async getOptionChain(instrument: string, expiration: string): Promise<OptionData[]> {
    const instruments = await this.fetchInstruments(this.baseCurrency, 'option');

    // Convert YYYY-MM-DD to DDMMMYY (e.g., 2025-09-02 to 2SEP25)
    const [yearStr, monthStr, dayStr] = expiration.split('-');
    const date = new Date(Number(yearStr), Number(monthStr) - 1, Number(dayStr));
    const months = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear().toString().slice(-2);
    const deribitExpirationFormat = `${day}${month}${year}`;

    const filteredInstruments = instruments.filter(
      (instrumentData) => instrumentData.instrument_name.includes(deribitExpirationFormat) &&
                          instrumentData.base_currency === this.baseCurrency &&
                          instrumentData.quote_currency === this.quoteCurrency
    );

    const optionData: OptionData[] = [];
    for (const instrumentData of filteredInstruments) {
      const bookSummary = await this.fetchBookSummary(instrumentData.instrument_name);
      if (bookSummary) {
        optionData.push({
          strike: instrumentData.strike,
          type: instrumentData.option_type,
          impliedVolatility: bookSummary.mark_iv,
          volume: bookSummary.volume ?? 0,
          openInterest: bookSummary.open_interest,
          bidPrice: bookSummary.bid_price ?? 0,
          askPrice: bookSummary.ask_price ?? 0,
          lastPrice: bookSummary.last ?? 0,
          expiration: new Date(instrumentData.expiration_timestamp).toISOString(),
          instrument_name: instrumentData.instrument_name,
        });
      }
    }
    return optionData;
  }

  async getAvailableExpirations(instrument: string): Promise<string[]> {
    const allInstrumentsForBase = await this.fetchInstruments(this.baseCurrency, 'option');
    const relevantInstruments = allInstrumentsForBase.filter(
      (inst) => inst.base_currency === this.baseCurrency && inst.quote_currency === this.quoteCurrency
    );

    const relevantExpirations = relevantInstruments.map(instrumentData => {
      const date = new Date(instrumentData.expiration_timestamp);
      return date.toISOString().split('T')[0];
    });

    const uniqueExpirations = [...new Set(relevantExpirations)].sort();

    return uniqueExpirations;
  }

  async getCurrentPrice(instrument: string): Promise<number> {
    const indexName = `${this.baseCurrency.toLowerCase()}_${this.quoteCurrency.toLowerCase()}`;
    const json = await this.fetchFromApi(`/public/get_index_price?index_name=${indexName}`);
    const indexPrice = IndexPriceSchema.parse(json.result);
    return indexPrice.index_price;
  }

  private async fetchInstruments(currency: string, kind: 'option' | 'future') {
    const json = await this.fetchFromApi(`/public/get_instruments?currency=${this.quoteCurrency}&kind=${kind}`);
    return z.array(InstrumentSchema).parse(json.result);
  }

  private async fetchBookSummary(instrumentName: string) {
    const json = await this.fetchFromApi(`/public/get_book_summary_by_instrument?instrument_name=${instrumentName}`);
    const result = z.array(BookSummarySchema).parse(json.result);
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
