function formatStandard(num) {
  let n = EN(num);
  if (n.lt(1000)) return n.toFixed(2);

  const suffixes = [
    "",
    "k",
    "M",
    "B",
    "T",
    "Qa",
    "Qi",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "Dc",
    "Ud",
    "Dd",
    "Td",
    "Qd",
    "qd",
    "Sd",
    "sd",
    "Od",
    "Nd",
    "Vg",
    "Uv",
    "Dv",
    "Tv",
    "Qv",
    "qv",
    "Sv",
    "sv",
    "Ov",
    "Nv",
    "Tg",
    "Ut",
    "Dt",
    "Tt",
    "Qt",
    "qt",
    "St",
    "st",
    "Ot",
    "Nt",
    "Qg",
    "Uq",
    "Dq",
    "Tq",
    "Qq",
    "qq",
    "Sq",
    "sq",
    "Oq",
    "Nq",
    "Sg",
    "Us",
    "Ds",
    "Ts",
    "Qs",
    "qs",
    "Ss",
    "ss",
    "Os",
    "Ns",
    "Spg",
    "Usg",
    "Dsg",
    "Tsg",
    "Qsg",
    "qsg",
    "Ssg",
    "ssg",
    "Osg",
    "Nsg",
    "Og",
    "Uo",
    "Do",
    "To",
    "Qo",
    "qo",
    "So",
    "so",
    "Oo",
    "No",
    "Ng",
    "Un",
    "Dn",
    "Tn",
    "Qn",
    "qn",
    "Sn",
    "sn",
    "On",
    "Nn",
    "Ct", // Centillion at 1e303
  ];

  let e = n.log10().floor().toNumber();
  let idx = Math.floor(e / 3);

  if (idx < suffixes.length) {
    return n.div(EN(10).pow(idx * 3)).toFixed(2) + suffixes[idx];
  }

  // Fallback for massive exponents (e.g., 1e306 becomes 1.00e306)
  return n.toExponential(2).replace("e+", "e");
}

function format(n) {
  let num = EN(n);
  if (num.lt(1000)) return num.toNumber().toFixed(2);

  // Level 3: Double Exponent (ee scale) -> 1ee1,000,000
  if (num.gte("1e1e1000000")) {
    let doubleLog = num.log10().log10();
    return "1ee" + formatStandard(doubleLog);
  }

  // Level 2: High Exponent -> 1e1.50M
  if (num.gte("1e1000000")) {
    let singleLog = num.log10();
    return "1e" + formatStandard(singleLog);
  }

  // Level 1: Standard / Mixed Scientific
  if (num.lt("1e303")) {
    return formatStandard(num);
  } else {
    // Between Centillion and 1e1M, use pure Scientific
    return num.toExponential(2).replace("e+", "e");
  }
}
