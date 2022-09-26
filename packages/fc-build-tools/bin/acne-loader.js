var CCVList = [];
var ACNList = [
  "fgC1", "fgC2", "ucBgC1", "ucBgC2", "bgC1",
  "bgC2", "fgGray", "bgGray", "warnH1", "warnH2",
  "warnM1", "warnM2", "warnL1", "warnL2", "warnL3",
  "warnL4"
];

var ACNEMatchReg = new RegExp(`(${ACNList.join("|")})([CTA][+-]\\d+){0,3}`, 'g');
var CTAMatchReg = /[CTA][+-]\d+/gi;
var CCV = '';
exports.default = function (source) {
  return source.replace(ACNEMatchReg, function (acneStr, $1) {
    CCV = acneStr.replace(CTAMatchReg, function (CTA) {
      const [attr, dir, value] = CTA.split(/\b/);
      return `${attr}${dir === "-" ? "_" : ""}${value}`;
    })
    CCVList.push(CCV);
    return `--${CCV}`
  });
}
exports.GET_CCVList = CCVList;