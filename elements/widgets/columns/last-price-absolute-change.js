/** @decorator */

import { html, observable, when } from '../../../vendor/fast-element.min.js';
import { uuidv4 } from '../../../lib/ppp-crypto.js';
import { formatAbsoluteChange, getUSMarketSession } from '../../../lib/intl.js';
import { Column, columnStyles } from './column.js';
import { TRADER_DATUM } from '../../../lib/const.js';

export const columnTemplate = html`
  <template>
    ${when(
      (x) => x.isBalance,
      html`<span></span>`,
      html`
        <div class="control-line dot-line">
          <span
            ?hidden="${(cell) =>
              cell.datum === TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE ||
              typeof cell.lastPriceAbsoluteChange !== 'number' ||
              isNaN(cell.lastPriceAbsoluteChange) ||
              cell.currentUSMarketSession === 'regular'}"
            class="dot ${(cell) =>
              cell.currentUSMarketSession === 'premarket' ? 'dot-1' : 'dot-4'}"
          ></span>
          <span
            class="${(x) =>
              x.lastPriceAbsoluteChange > 0
                ? 'positive'
                : x.lastPriceAbsoluteChange < 0
                ? 'negative'
                : ''}"
          >
            ${(cell) =>
              formatAbsoluteChange(
                cell.lastPriceAbsoluteChange,
                cell.payload?.instrument
              )}
          </span>
        </div>
      `
    )}
  </template>
`;

export class LastPriceAbsoluteChangeColumn extends Column {
  @observable
  lastPriceAbsoluteChange;

  lastPriceAbsoluteChangeChanged() {
    this.currentUSMarketSession = getUSMarketSession();
  }

  @observable
  currentUSMarketSession;

  datum;

  constructor(datum = TRADER_DATUM.LAST_PRICE_ABSOLUTE_CHANGE) {
    super();

    this.datum = datum;
  }

  async connectedCallback() {
    this.currentUSMarketSession = getUSMarketSession();

    await super.connectedCallback();

    if (!this.isBalance) {
      await this.subscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: this.datum
        }
      });
    }
  }

  async disconnectedCallback() {
    if (!this.isBalance) {
      await this.unsubscribeFields?.({
        source: this,
        fieldDatumPairs: {
          lastPriceAbsoluteChange: this.datum
        }
      });
    }

    return super.disconnectedCallback();
  }
}

// noinspection JSVoidFunctionReturnValueUsed
export default LastPriceAbsoluteChangeColumn.compose({
  name: `ppp-${uuidv4()}`,
  template: columnTemplate,
  styles: columnStyles
}).define();
