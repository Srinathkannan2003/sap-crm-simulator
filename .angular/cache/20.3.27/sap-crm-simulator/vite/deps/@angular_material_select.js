import {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatOptgroup,
  MatOption,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger
} from "./chunk-R4BFGKRV.js";
import "./chunk-VZJQJBM6.js";
import "./chunk-YIDU4QSX.js";
import "./chunk-LYENLQZU.js";
import "./chunk-IMOBHY23.js";
import "./chunk-KQ7ZTWKC.js";
import "./chunk-O37P3CYG.js";
import "./chunk-52ZYFZXK.js";
import "./chunk-GA3IJZK4.js";
import "./chunk-RE6Y6UCA.js";
import {
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatPrefix,
  MatSuffix
} from "./chunk-L64NNPPS.js";
import "./chunk-VUBSJA2A.js";
import "./chunk-LSSPRBPW.js";
import "./chunk-VENV3F3G.js";
import "./chunk-46HAYV32.js";
import "./chunk-LTTOVATH.js";
import "./chunk-5EG33CFQ.js";
import "./chunk-SQCPF3HE.js";
import "./chunk-HMYFIRPC.js";
import "./chunk-PJHWHGOS.js";
import "./chunk-C4ETSFXH.js";
import "./chunk-6GJVRQQP.js";
import "./chunk-PMAPKKKW.js";
import "./chunk-Z2F3YGBP.js";
import "./chunk-UO6N24ZM.js";
import "./chunk-AQ4QVDXJ.js";
import "./chunk-JRX4MMIO.js";
import "./chunk-LEJJXDXR.js";
import "./chunk-RSS3ODKE.js";
import "./chunk-WDMUDEB6.js";

// node_modules/@angular/material/fesm2022/select.mjs
var matSelectAnimations = {
  // Represents
  // trigger('transformPanel', [
  //   state(
  //     'void',
  //     style({
  //       opacity: 0,
  //       transform: 'scale(1, 0.8)',
  //     }),
  //   ),
  //   transition(
  //     'void => showing',
  //     animate(
  //       '120ms cubic-bezier(0, 0, 0.2, 1)',
  //       style({
  //         opacity: 1,
  //         transform: 'scale(1, 1)',
  //       }),
  //     ),
  //   ),
  //   transition('* => void', animate('100ms linear', style({opacity: 0}))),
  // ])
  /** This animation transforms the select's overlay panel on and off the page. */
  transformPanel: {
    type: 7,
    name: "transformPanel",
    definitions: [
      {
        type: 0,
        name: "void",
        styles: {
          type: 6,
          styles: { opacity: 0, transform: "scale(1, 0.8)" },
          offset: null
        }
      },
      {
        type: 1,
        expr: "void => showing",
        animation: {
          type: 4,
          styles: {
            type: 6,
            styles: { opacity: 1, transform: "scale(1, 1)" },
            offset: null
          },
          timings: "120ms cubic-bezier(0, 0, 0.2, 1)"
        },
        options: null
      },
      {
        type: 1,
        expr: "* => void",
        animation: {
          type: 4,
          styles: { type: 6, styles: { opacity: 0 }, offset: null },
          timings: "100ms linear"
        },
        options: null
      }
    ],
    options: {}
  }
};
export {
  MAT_SELECT_CONFIG,
  MAT_SELECT_SCROLL_STRATEGY,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER,
  MAT_SELECT_SCROLL_STRATEGY_PROVIDER_FACTORY,
  MAT_SELECT_TRIGGER,
  MatError,
  MatFormField,
  MatHint,
  MatLabel,
  MatOptgroup,
  MatOption,
  MatPrefix,
  MatSelect,
  MatSelectChange,
  MatSelectModule,
  MatSelectTrigger,
  MatSuffix,
  matSelectAnimations
};
//# sourceMappingURL=@angular_material_select.js.map
