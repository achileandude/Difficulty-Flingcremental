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
    "Qn",
    "Sx",
    "Sp",
    "Oc",
    "No",
    "De",
    "UDe",
    "DDe",
    "TDe",
    "QaDe",
    "QnDe",
    "SxDe",
    "SpDe",
    "OcDe",
    "NoDe",
    "Vg",
    "UVg",
    "DVg",
    "TVg",
    "QaVg",
    "QnVg",
    "SxVg",
    "SpVg",
    "OcVg",
    "NoVg",
    "Tg",
    "UTg",
    "DTg",
    "TTg",
    "QdTg",
    "QnTg",
    "SxTg",
    "SpTg",
    "OcTg",
    "NoTg",
    "qg",
    "Uqg",
    "Dqg",
    "Tqg",
    "Qdqg",
    "Qnqg",
    "Sxqg",
    "Spqg",
    "Ocqg",
    "Noqg",
    "Qg",
    "UQg",
    "DQg",
    "TQg",
    "QdQg",
    "QnQg",
    "SxQg",
    "SpQg",
    "OcQg",
    "NoQg",
    "sg",
    "Usg",
    "Dsg",
    "Tsg",
    "Qdsg",
    "Qnsg",
    "Sxsg",
    "Spsg",
    "Ocsg",
    "Nosg",
    "Sg",
    "USg",
    "DSg",
    "TSg",
    "QdSg",
    "QnSg",
    "SxSg",
    "SpSg",
    "OcSg",
    "NoSg",
    "Og",
    "UOg",
    "DOg",
    "TOg",
    "QdOg",
    "QnOg",
    "SxOg",
    "SpOg",
    "OcOg",
    "NoOg",
    "Ng",
    "UNg",
    "DNg",
    "TNg",
    "QdNg",
    "QnNg",
    "SxNg",
    "SpNg",
    "OcNg",
    "NoNg",
    "Ce", // Centillion at 1e303
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
