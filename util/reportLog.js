var Multispinner = require("multispinner");
const spinners = ["foo"];

// instantiate and start spinners

// finish spinners in staggered timeouts
// setTimeout(() => m.success("foo"), 4000);
var condition = true;
count = 0;
while (condition) {
  count = count + 1;
  if (count > 4) {
    condition = false;
    m.success("foo");
  }
}
