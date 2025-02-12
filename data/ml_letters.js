const data = [
    {
        ml: "അ",
        en: "a",
        group: "Vowels",
        dependants: [
            { ml: "് ", en: "a - അ", audible: false },
            { ml: "ാ ", en: "aa - ആ", audible: false },
            { ml: "ി ", en: "i - ഇ", audible: false },
            { ml: "ീ ", en: "ii - ഈ", audible: false },
            { ml: "ു ", en: "u - ഉ", audible: false },
            { ml: "ൂ ", en: "uu - ഊ", audible: false },
            { ml: "ൃ ", en: "ru - ഋ", audible: false },
            { ml: "െ ", en: "a - എ", audible: false },
            { ml: "േ ", en: "ee - ഏ", audible: false },
            { ml: "ൈ ", en: "ai - ഐ", audible: false },
            { ml: "ൊ ", en: "o - ഒ", audible: false },
            { ml: "ോ ", en: "oo - ഓ", audible: false },
            { ml: "ൌ ", en: "au - ഔ", audible: false },
            { ml: "ം ", en: "am - അം", audible: false },
            { ml: "ഃ ", en: "ah - അഃ", audible: false }
        ],
        examples: [
            { en: "amma", ml: "അമ്മ", "en-meaning": "Mother" },
            { en: "akam", ml: "അകം", "en-meaning": "Inside" }
        ]
    },
    {
        ml: "ആ",
        en: "aa",
        group: "Vowels",
        examples: [
            { en: "aakasham", ml: "ആകാശം", "en-meaning": "Sky" },
            { en: "aaraamam", ml: "ആരാമം", "en-meaning": "Comfort" }
        ]
    },
    {
        ml: "ഇ",
        en: "i",
        group: "Vowels",
        examples: [
            { en: "ilam", ml: "ഇലം", "en-meaning": "Young" },
            { en: "iravi", ml: "ഇരാവി", "en-meaning": "Night" }
        ]
    },
    {
        ml: "ഈ",
        en: "ii",
        group: "Vowels",
        examples: [
            { en: "eedu", ml: "ഈട്", "en-meaning": "Step" },
            { en: "iira", ml: "ഈറ", "en-meaning": "Courage" }
        ]
    },
    {
        ml: "ഉ",
        en: "u",
        group: "Vowels",
        examples: [
            { en: "urakkam", ml: "ഉറക്കം", "en-meaning": "Sleep" },
            { en: "udakam", ml: "ഉടകം", "en-meaning": "Water" }
        ]
    },
    {
        ml: "ഊ",
        en: "uu",
        group: "Vowels",
        examples: [
            { en: "oolam", ml: "ഊളം", "en-meaning": "Deep" },
            { en: "oolal", ml: "ഊളം", "en-meaning": "Sound" }
        ]
    },
    {
        ml: "ഋ",
        en: "ru",
        group: "Vowels",
        examples: [
            { en: "ruchi", ml: "രുചി", "en-meaning": "Taste" },
            { en: "rithu", ml: "രിതു", "en-meaning": "Season" }
        ]
    },
    {
        ml: "എ",
        en: "e",
        group: "Vowels",
        examples: [
            { en: "ello", ml: "എല്ലോ", "en-meaning": "Hello" },
            { en: "ebam", ml: "എബം", "en-meaning": "Love" }
        ]
    },
    {
        ml: "ഏ",
        en: "ee",
        group: "Vowels",
        examples: [
            { en: "eela", ml: "ഈല", "en-meaning": "Fish" },
            { en: "eenadu", ml: "ഈനാട്", "en-meaning": "Area" }
        ]
    },
    {
        ml: "ഐ",
        en: "ai",
        group: "Vowels",
        examples: [
            { en: "aikya", ml: "ഐക്യ", "en-meaning": "Unity" },
            { en: "aimai", ml: "ഐമൈ", "en-meaning": "Intention" }
        ]
    },
    {
        ml: "ഒ",
        en: "o",
        group: "Vowels",
        examples: [
            { en: "olu", ml: "ഒളം", "en-meaning": "Wind" },
            { en: "orun", ml: "ഒരുന", "en-meaning": "One" }
        ]
    },
    {
        ml: "ഓ",
        en: "oo",
        group: "Vowels",
        examples: [
            { en: "oolam", ml: "ഓലം", "en-meaning": "Sea" },
            { en: "oovum", ml: "ഓവും", "en-meaning": "All" }
        ]
    },
    {
        ml: "ഔ",
        en: "au",
        group: "Vowels",
        examples: [
            { en: "audam", ml: "ഔടം", "en-meaning": "Stone" },
            { en: "aural", ml: "ഔരൽ", "en-meaning": "Hearing" }
        ]
    },
    {
        ml: "അം",
        en: "am",
        group: "Vowels",
        examples: [
            { en: "sambhavam", ml: "സംഭവം", "en-meaning": "Event" },
            { en: "sahya", ml: "സഹ്യ", "en-meaning": "Support" }
        ]
    },
    {
        ml: "അഃ",
        en: "ah",
        group: "Vowels",
        examples: [
            { en: "ahimsa", ml: "അഹിംസ", "en-meaning": "Nonviolence" }
        ]
    },
    {
        ml: "ക",
        en: "ka",
        group: "Consonants",
        subgroup: "ക - Velar",
        dependants: [
            { ml: "കാ", en: "kaa" },
            { ml: "കി", en: "ki" },
            { ml: "കീ", en: "kii" },
            { ml: "കു", en: "ku" },
            { ml: "കൂ", en: "kuu" },
            { ml: "കൃ", en: "kru" },
            { ml: "കെ", en: "ke" },
            { ml: "കേ", en: "kee" },
            { ml: "കൈ", en: "kai" },
            { ml: "കൊ", en: "ko" },
            { ml: "കോ", en: "koo" },
            { ml: "കൗ", en: "kau" },
            { ml: "കം", en: "kam" },
            { ml: "കഃ", en: "kah" },
            { ml: "ക്", en: "ka" },
        ],
        examples: [
            { en: "kalam", ml: "കലം", "en-meaning": "Art" },
            { en: "kavitha", ml: "കവിത", "en-meaning": "Poetry" }
        ]
    },
    {
        ml: "ഖ",
        en: "kha",
        group: "Consonants",
        subgroup: "ക - Velar",
        dependants: [
            { ml: "ഖാ", en: "khaa" },
            { ml: "ഖി", en: "khi" },
            { ml: "ഖീ", en: "khii" },
            { ml: "ഖു", en: "khu" },
            { ml: "ഖൂ", en: "khuu" },
            { ml: "ഖൃ", en: "khru" },
            { ml: "ഖെ", en: "khe" },
            { ml: "ഖേ", en: "khee" },
            { ml: "ഖൈ", en: "khai" },
            { ml: "ഖൊ", en: "kho" },
            { ml: "ഖോ", en: "khoo" },
            { ml: "ഖൗ", en: "khau" },
            { ml: "ഖം", en: "kham" },
            { ml: "ഖഃ", en: "khah" },
            { ml: "ഖ്", en: "kha" },
        ],
        examples: [
            { en: "khadi", ml: "ഖദി", "en-meaning": "Handspun cloth" }
        ]
    },
    {
        ml: "ഗ",
        en: "ga",
        group: "Consonants",
        subgroup: "ക - Velar",
        dependants: [
            { ml: "ഗാ", en: "gaa" },
            { ml: "ഗി", en: "gi" },
            { ml: "ഗീ", en: "gii" },
            { ml: "ഗു", en: "gu" },
            { ml: "ഗൂ", en: "guu" },
            { ml: "ഗൃ", en: "gru" },
            { ml: "ഗെ", en: "ge" },
            { ml: "ഗേ", en: "gee" },
            { ml: "ഗൈ", en: "gai" },
            { ml: "ഗൊ", en: "go" },
            { ml: "ഗോ", en: "goo" },
            { ml: "ഗൗ", en: "gau" },
            { ml: "ഗം", en: "gam" },
            { ml: "ഗഃ", en: "gah" },
            { ml: "ഗ്", en: "ga" },
        ],
        examples: [
            { en: "gaja", ml: "ഗജ", "en-meaning": "Elephant" }
        ]
    },
    {
        ml: "ഘ",
        en: "gha",
        group: "Consonants",
        subgroup: "ക - Velar",
        dependants: [
            { ml: "ഘാ", en: "ghaa" },
            { ml: "ഘി", en: "ghi" },
            { ml: "ഘീ", en: "ghii" },
            { ml: "ഘു", en: "ghu" },
            { ml: "ഘൂ", en: "ghuu" },
            { ml: "ഘൃ", en: "ghru" },
            { ml: "ഘെ", en: "ghe" },
            { ml: "ഘേ", en: "ghee" },
            { ml: "ഘൈ", en: "ghai" },
            { ml: "ഘൊ", en: "gho" },
            { ml: "ഘോ", en: "ghoo" },
            { ml: "ഘൗ", en: "ghau" },
            { ml: "ഘം", en: "gham" },
            { ml: "ഘഃ", en: "ghah" },
            { ml: "ഘ്", en: "gha" },
        ],
        examples: [
            { en: "ghanta", ml: "ഘണ്ട", "en-meaning": "Bell" }
        ]
    },
    {
        ml: "ങ",
        en: "ṅa",
        group: "Consonants",
        subgroup: "ക - Velar",
        dependants: [
            { ml: "ങാ", en: "ṅaa" },
            { ml: "ങി", en: "ṅi" },
            { ml: "ങീ", en: "ṅii" },
            { ml: "ങു", en: "ṅu" },
            { ml: "ങൂ", en: "ṅuu" },
            { ml: "ങൃ", en: "ṅru" },
            { ml: "ങെ", en: "ṅe" },
            { ml: "ങേ", en: "ṅee" },
            { ml: "ങൈ", en: "ṅai" },
            { ml: "ങൊ", en: "ṅo" },
            { ml: "ങോ", en: "ṅoo" },
            { ml: "ങൗ", en: "ṅau" },
            { ml: "ങം", en: "ṅam" },
            { ml: "ങഃ", en: "ṅah" },
            { ml: "ങ്", en: "nga" },
        ],
        examples: [
            { en: "ṅanam", ml: "ങണം", "en-meaning": "Knowledge" }
        ]
    },
    {
        ml: "ച",
        en: "cha",
        group: "Consonants",
        subgroup: "ച - Postalveolar",
        dependants: [
            { ml: "ചാ", en: "chaa" },
            { ml: "ചി", en: "chi" },
            { ml: "ചീ", en: "chii" },
            { ml: "ചു", en: "chu" },
            { ml: "ചൂ", en: "chuu" },
            { ml: "ചൃ", en: "chru" },
            { ml: "ചെ", en: "che" },
            { ml: "ചേ", en: "chee" },
            { ml: "ചൈ", en: "chai" },
            { ml: "ചൊ", en: "cho" },
            { ml: "ചോ", en: "choo" },
            { ml: "ചൗ", en: "chau" },
            { ml: "ചം", en: "cham" },
            { ml: "ചഃ", en: "chah" },
            { ml: "ച്", en: "cha" },
        ],
        examples: [
            { en: "chaya", ml: "ചായ", "en-meaning": "Tea" }
        ]
    },
    {
        ml: "ഛ",
        en: "chha",
        group: "Consonants",
        subgroup: "ച - Postalveolar",
        dependants: [
            { ml: "ഛാ", en: "chhaa" },
            { ml: "ഛി", en: "chhi" },
            { ml: "ഛീ", en: "chhii" },
            { ml: "ഛു", en: "chhu" },
            { ml: "ഛൂ", en: "chhuu" },
            { ml: "ഛൃ", en: "chhru" },
            { ml: "ഛെ", en: "chhe" },
            { ml: "ഛേ", en: "chhee" },
            { ml: "ഛൈ", en: "chhai" },
            { ml: "ഛൊ", en: "chho" },
            { ml: "ഛോ", en: "chhoo" },
            { ml: "ഛൗ", en: "chhau" },
            { ml: "ഛം", en: "chham" },
            { ml: "ഛഃ", en: "chhah" },
            { ml: "ഛ്", en: "chha" },
        ],
        examples: [
            { en: "chhaya", ml: "ഛായ", "en-meaning": "Shadow" }
        ]
    },
    {
        ml: "ജ",
        en: "ja",
        group: "Consonants",
        subgroup: "ച - Postalveolar",
        dependants: [
            { ml: "ജാ", en: "jaa" },
            { ml: "ജി", en: "ji" },
            { ml: "ജീ", en: "jii" },
            { ml: "ജു", en: "ju" },
            { ml: "ജൂ", en: "juu" },
            { ml: "ജൃ", en: "jru" },
            { ml: "ജെ", en: "je" },
            { ml: "ജേ", en: "jee" },
            { ml: "ജൈ", en: "jai" },
            { ml: "ജൊ", en: "jo" },
            { ml: "ജോ", en: "joo" },
            { ml: "ജൗ", en: "jau" },
            { ml: "ജം", en: "jam" },
            { ml: "ജഃ", en: "jah" },
            { ml: "ജ്", en: "ja" },
        ],
        examples: [
            { en: "jala", ml: "ജല", "en-meaning": "Water" }
        ]
    },
    {
        ml: "ഝ",
        en: "jha",
        group: "Consonants",
        subgroup: "ച - Postalveolar",
        dependants: [
            { ml: "ഝാ", en: "jhaa" },
            { ml: "ഝി", en: "jhi" },
            { ml: "ഝീ", en: "jhii" },
            { ml: "ഝു", en: "jhu" },
            { ml: "ഝൂ", en: "jhuu" },
            { ml: "ഝൃ", en: "jhru" },
            { ml: "ഝെ", en: "jhe" },
            { ml: "ഝേ", en: "jhee" },
            { ml: "ഝൈ", en: "jhai" },
            { ml: "ഝൊ", en: "jho" },
            { ml: "ഝോ", en: "jhoo" },
            { ml: "ഝൗ", en: "jhau" },
            { ml: "ഝം", en: "jham" },
            { ml: "ഝഃ", en: "jhah" },
            { ml: "ഝ്", en: "jha" },
        ],
        examples: [
            { en: "jhanam", ml: "ഝനം", "en-meaning": "Bell" }
        ]
    },
    {
        ml: "ഞ",
        en: "ña",
        group: "Consonants",
        subgroup: "ച - Postalveolar",
        dependants: [
            { ml: "ഞാ", en: "ñaa" },
            { ml: "ഞി", en: "ñi" },
            { ml: "ഞീ", en: "ñii" },
            { ml: "ഞു", en: "ñu" },
            { ml: "ഞൂ", en: "ñuu" },
            { ml: "ഞൃ", en: "ñru" },
            { ml: "ഞെ", en: "ñe" },
            { ml: "ഞേ", en: "ñee" },
            { ml: "ഞൈ", en: "ñai" },
            { ml: "ഞൊ", en: "ño" },
            { ml: "ഞോ", en: "ñoo" },
            { ml: "ഞൗ", en: "ñau" },
            { ml: "ഞം", en: "ñam" },
            { ml: "ഞഃ", en: "ñah" },
            { ml: "ഞ്", en: "nya" },
        ],
        examples: [
            { en: "ñanam", ml: "ഞണം", "en-meaning": "Knowledge" }
        ]
    },
    {
        ml: "ട",
        en: "ṭa",
        group: "Consonants",
        subgroup: "ട - Retroflex",
        dependants: [
            { ml: "ടാ", en: "ṭaa" },
            { ml: "ടി", en: "ṭi" },
            { ml: "ടീ", en: "ṭii" },
            { ml: "ടു", en: "ṭu" },
            { ml: "ടൂ", en: "ṭuu" },
            { ml: "ടൃ", en: "ṭru" },
            { ml: "ടെ", en: "ṭe" },
            { ml: "ടേ", en: "ṭee" },
            { ml: "ടൈ", en: "ṭai" },
            { ml: "ടൊ", en: "ṭo" },
            { ml: "ടോ", en: "ṭoo" },
            { ml: "ടൗ", en: "ṭau" },
            { ml: "ടം", en: "ṭam" },
            { ml: "ടഃ", en: "ṭah" },
            { ml: "ട്", en: "ta" },
        ],
        examples: [
            { en: "ṭankam", ml: "ടങ്കം", "en-meaning": "Coin" }
        ]
    },
    {
        ml: "ഠ",
        en: "ṭha",
        group: "Consonants",
        subgroup: "ട - Retroflex",
        dependants: [
            { ml: "ഠാ", en: "ṭhaa" },
            { ml: "ഠി", en: "ṭhi" },
            { ml: "ഠീ", en: "ṭhii" },
            { ml: "ഠു", en: "ṭhu" },
            { ml: "ഠൂ", en: "ṭhuu" },
            { ml: "ഠൃ", en: "ṭhru" },
            { ml: "ഠെ", en: "ṭhe" },
            { ml: "ഠേ", en: "ṭhee" },
            { ml: "ഠൈ", en: "ṭhai" },
            { ml: "ഠൊ", en: "ṭho" },
            { ml: "ഠോ", en: "ṭhoo" },
            { ml: "ഠൗ", en: "ṭhau" },
            { ml: "ഠം", en: "ṭham" },
            { ml: "ഠഃ", en: "ṭhah" },
            { ml: "ഠ്", en: "ttha" },
        ],
        examples: [
            { en: "ṭhalam", ml: "ഠലം", "en-meaning": "Stage" }
        ]
    },
    {
        ml: "ഡ",
        en: "ḍa",
        group: "Consonants",
        subgroup: "ട - Retroflex",
        dependants: [
            { ml: "ഡാ", en: "ḍaa" },
            { ml: "ഡി", en: "ḍi" },
            { ml: "ഡീ", en: "ḍii" },
            { ml: "ഡു", en: "ḍu" },
            { ml: "ഡൂ", en: "ḍuu" },
            { ml: "ഡൃ", en: "ḍru" },
            { ml: "ഡെ", en: "ḍe" },
            { ml: "ഡേ", en: "ḍee" },
            { ml: "ഡൈ", en: "ḍai" },
            { ml: "ഡൊ", en: "ḍo" },
            { ml: "ഡോ", en: "ḍoo" },
            { ml: "ഡൗ", en: "ḍau" },
            { ml: "ഡം", en: "ḍam" },
            { ml: "ഡഃ", en: "ḍah" },
            { ml: "ഡ്", en: "dda" },
        ],
        examples: [
            { en: "ḍakka", ml: "ഡക്ക", "en-meaning": "Push" }
        ]
    },
    {
        ml: "ഢ",
        en: "ḍha",
        group: "Consonants",
        subgroup: "ട - Retroflex",
        dependants: [
            { ml: "ഢാ", en: "ḍhaa" },
            { ml: "ഢി", en: "ḍhi" },
            { ml: "ഢീ", en: "ḍhii" },
            { ml: "ഢു", en: "ḍhu" },
            { ml: "ഢൂ", en: "ḍhuu" },
            { ml: "ഢൃ", en: "ḍhru" },
            { ml: "ഢെ", en: "ḍhe" },
            { ml: "ഢേ", en: "ḍhee" },
            { ml: "ഢൈ", en: "ḍhai" },
            { ml: "ഢൊ", en: "ḍho" },
            { ml: "ഢോ", en: "ḍhoo" },
            { ml: "ഢൗ", en: "ḍhau" },
            { ml: "ഢം", en: "ḍham" },
            { ml: "ഢഃ", en: "ḍhah" },
            { ml: "ഢ്", en: "ddha" },
        ],
        examples: [
            { en: "ḍhakka", ml: "ഢക്ക", "en-meaning": "Push" }
        ]
    },
    {
        ml: "ണ",
        en: "ṇa",
        group: "Consonants",
        subgroup: "ട - Retroflex",
        dependants: [
            { ml: "ണാ", en: "ṇaa" },
            { ml: "ണി", en: "ṇi" },
            { ml: "ണീ", en: "ṇii" },
            { ml: "ണു", en: "ṇu" },
            { ml: "ണൂ", en: "ṇuu" },
            { ml: "ണൃ", en: "ṇru" },
            { ml: "ണെ", en: "ṇe" },
            { ml: "ണേ", en: "ṇee" },
            { ml: "ണൈ", en: "ṇai" },
            { ml: "ണൊ", en: "ṇo" },
            { ml: "ണോ", en: "ṇoo" },
            { ml: "ണൗ", en: "ṇau" },
            { ml: "ണം", en: "ṇam" },
            { ml: "ണഃ", en: "ṇah" },
            { ml: "ണ്", en: "nna" },
        ],
        examples: [
            { en: "ṇanam", ml: "ണണം", "en-meaning": "Knowledge" }
        ]
    },
    {
        ml: "ത",
        en: "ta",
        group: "Consonants",
        subgroup: "ത - Dental",
        dependants: [
            { ml: "താ", en: "taa" },
            { ml: "തി", en: "ti" },
            { ml: "തീ", en: "tii" },
            { ml: "തു", en: "tu" },
            { ml: "തൂ", en: "tuu" },
            { ml: "തൃ", en: "tru" },
            { ml: "തെ", en: "te" },
            { ml: "തേ", en: "tee" },
            { ml: "തൈ", en: "tai" },
            { ml: "തൊ", en: "to" },
            { ml: "തോ", en: "too" },
            { ml: "തൗ", en: "tau" },
            { ml: "തം", en: "tam" },
            { ml: "തഃ", en: "tah" },
            { ml: "ത്", en: "tha" },
        ],
        examples: [
            { en: "tala", ml: "തല", "en-meaning": "Head" }
        ]
    },
    {
        ml: "ഥ",
        en: "tha",
        group: "Consonants",
        subgroup: "ത - Dental",
        dependants: [
            { ml: "ഥാ", en: "thaa" },
            { ml: "ഥി", en: "thi" },
            { ml: "ഥീ", en: "thii" },
            { ml: "ഥു", en: "thu" },
            { ml: "ഥൂ", en: "thuu" },
            { ml: "ഥൃ", en: "thru" },
            { ml: "ഥെ", en: "the" },
            { ml: "ഥേ", en: "thee" },
            { ml: "ഥൈ", en: "thai" },
            { ml: "ഥൊ", en: "tho" },
            { ml: "ഥോ", en: "thoo" },
            { ml: "ഥൗ", en: "thau" },
            { ml: "ഥം", en: "tham" },
            { ml: "ഥഃ", en: "thah" },
            { ml: "ഥ്", en: "thha" },
        ],
        examples: [
            { en: "thalam", ml: "ഥലം", "en-meaning": "Stage" }
        ]
    },
    {
        ml: "ദ",
        en: "da",
        group: "Consonants",
        subgroup: "ത - Dental",
        dependants: [
            { ml: "ദാ", en: "daa" },
            { ml: "ദി", en: "di" },
            { ml: "ദീ", en: "dii" },
            { ml: "ദു", en: "du" },
            { ml: "ദൂ", en: "duu" },
            { ml: "ദൃ", en: "dru" },
            { ml: "ദെ", en: "de" },
            { ml: "ദേ", en: "dee" },
            { ml: "ദൈ", en: "dai" },
            { ml: "ദൊ", en: "do" },
            { ml: "ദോ", en: "doo" },
            { ml: "ദൗ", en: "dau" },
            { ml: "ദം", en: "dam" },
            { ml: "ദഃ", en: "dah" },
            { ml: "ദ്", en: "da" },
        ],
        examples: [
            { en: "dalam", ml: "ദലം", "en-meaning": "Leaf" }
        ]
    },
    {
        ml: "ധ",
        en: "dha",
        group: "Consonants",
        subgroup: "ത - Dental",
        dependants: [
            { ml: "ധാ", en: "dhaa" },
            { ml: "ധി", en: "dhi" },
            { ml: "ധീ", en: "dhii" },
            { ml: "ധു", en: "dhu" },
            { ml: "ധൂ", en: "dhuu" },
            { ml: "ധൃ", en: "dhru" },
            { ml: "ധെ", en: "dhe" },
            { ml: "ധേ", en: "dhee" },
            { ml: "ധൈ", en: "dhai" },
            { ml: "ധൊ", en: "dho" },
            { ml: "ധോ", en: "dhoo" },
            { ml: "ധൗ", en: "dhau" },
            { ml: "ധം", en: "dham" },
            { ml: "ധഃ", en: "dhah" },
            { ml: "ധ്", en: "dha" },
        ],
        examples: [
            { en: "dhanam", ml: "ധനം", "en-meaning": "Wealth" }
        ]
    },
    {
        ml: "ന",
        en: "na",
        group: "Consonants",
        subgroup: "ത - Dental",
        dependants: [
            { ml: "നാ", en: "naa" },
            { ml: "നി", en: "ni" },
            { ml: "നീ", en: "nii" },
            { ml: "നു", en: "nu" },
            { ml: "നൂ", en: "nuu" },
            { ml: "നൃ", en: "nru" },
            { ml: "നെ", en: "ne" },
            { ml: "നേ", en: "nee" },
            { ml: "നൈ", en: "nai" },
            { ml: "നൊ", en: "no" },
            { ml: "നോ", en: "noo" },
            { ml: "നൗ", en: "nau" },
            { ml: "നം", en: "nam" },
            { ml: "നഃ", en: "nah" },
            { ml: "ന്", en: "na" },
        ],
        examples: [
            { en: "nalam", ml: "നലം", "en-meaning": "Good" }
        ]
    },
    {
        ml: "പ",
        en: "pa",
        group: "Consonants",
        subgroup: "പ - Labial",
        dependants: [
            { ml: "പാ", en: "paa" },
            { ml: "പി", en: "pi" },
            { ml: "പീ", en: "pii" },
            { ml: "പു", en: "pu" },
            { ml: "പൂ", en: "puu" },
            { ml: "പൃ", en: "pru" },
            { ml: "പെ", en: "pe" },
            { ml: "പേ", en: "pee" },
            { ml: "പൈ", en: "pai" },
            { ml: "പൊ", en: "po" },
            { ml: "പോ", en: "poo" },
            { ml: "പൗ", en: "pau" },
            { ml: "പം", en: "pam" },
            { ml: "പഃ", en: "pah" },
            { ml: "പ്", en: "pa" },
        ],
        examples: [
            { en: "pala", ml: "പല", "en-meaning": "Many" }
        ]
    },
    {
        ml: "ഫ",
        en: "pha",
        group: "Consonants",
        subgroup: "പ - Labial",
        dependants: [
            { ml: "ഫാ", en: "phaa" },
            { ml: "ഫി", en: "phi" },
            { ml: "ഫീ", en: "phii" },
            { ml: "ഫു", en: "phu" },
            { ml: "ഫൂ", en: "phuu" },
            { ml: "ഫൃ", en: "phru" },
            { ml: "ഫെ", en: "phe" },
            { ml: "ഫേ", en: "phee" },
            { ml: "ഫൈ", en: "phai" },
            { ml: "ഫൊ", en: "pho" },
            { ml: "ഫോ", en: "phoo" },
            { ml: "ഫൗ", en: "phau" },
            { ml: "ഫം", en: "pham" },
            { ml: "ഫഃ", en: "phah" },
            { ml: "ഫ്", en: "pha" },
        ],
        examples: [
            { en: "phalam", ml: "ഫലം", "en-meaning": "Fruit" }
        ]
    },
    {
        ml: "ബ",
        en: "ba",
        group: "Consonants",
        subgroup: "പ - Labial",
        dependants: [
            { ml: "ബാ", en: "baa" },
            { ml: "ബി", en: "bi" },
            { ml: "ബീ", en: "bii" },
            { ml: "ബു", en: "bu" },
            { ml: "ബൂ", en: "buu" },
            { ml: "ബൃ", en: "bru" },
            { ml: "ബെ", en: "be" },
            { ml: "ബേ", en: "bee" },
            { ml: "ബൈ", en: "bai" },
            { ml: "ബൊ", en: "bo" },
            { ml: "ബോ", en: "boo" },
            { ml: "ബൗ", en: "bau" },
            { ml: "ബം", en: "bam" },
            { ml: "ബഃ", en: "bah" },
            { ml: "ബ്", en: "ba" },
        ],
        examples: [
            { en: "balam", ml: "ബലം", "en-meaning": "Strength" }
        ]
    },
    {
        ml: "ഭ",
        en: "bha",
        group: "Consonants",
        subgroup: "പ - Labial",
        dependants: [
            { ml: "ഭാ", en: "bhaa" },
            { ml: "ഭി", en: "bhi" },
            { ml: "ഭീ", en: "bhii" },
            { ml: "ഭു", en: "bhu" },
            { ml: "ഭൂ", en: "bhuu" },
            { ml: "ഭൃ", en: "bhru" },
            { ml: "ഭെ", en: "bhe" },
            { ml: "ഭേ", en: "bhee" },
            { ml: "ഭൈ", en: "bhai" },
            { ml: "ഭൊ", en: "bho" },
            { ml: "ഭോ", en: "bhoo" },
            { ml: "ഭൗ", en: "bhau" },
            { ml: "ഭം", en: "bham" },
            { ml: "ഭഃ", en: "bhah" },
            { ml: "ഭ്", en: "bha" },
        ],
        examples: [
            { en: "bhanam", ml: "ഭനം", "en-meaning": "Light" }
        ]
    },
    {
        ml: "മ",
        en: "ma",
        group: "Consonants",
        subgroup: "പ - Labial",
        dependants: [
            { ml: "മാ", en: "maa" },
            { ml: "മി", en: "mi" },
            { ml: "മീ", en: "mii" },
            { ml: "മു", en: "mu" },
            { ml: "മൂ", en: "muu" },
            { ml: "മൃ", en: "mru" },
            { ml: "മെ", en: "me" },
            { ml: "മേ", en: "mee" },
            { ml: "മൈ", en: "mai" },
            { ml: "മൊ", en: "mo" },
            { ml: "മോ", en: "moo" },
            { ml: "മൗ", en: "mau" },
            { ml: "മം", en: "mam" },
            { ml: "മഃ", en: "mah" },
            { ml: "മ്", en: "ma" },
        ],
        examples: [
            { en: "mala", ml: "മല", "en-meaning": "Mountain" }
        ]
    },
    {
        ml: "യ",
        en: "ya",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "യാ", en: "yaa" },
            { ml: "യി", en: "yi" },
            { ml: "യീ", en: "yii" },
            { ml: "യു", en: "yu" },
            { ml: "യൂ", en: "yuu" },
            { ml: "യൃ", en: "yru" },
            { ml: "യെ", en: "ye" },
            { ml: "യേ", en: "yee" },
            { ml: "യൈ", en: "yai" },
            { ml: "യൊ", en: "yo" },
            { ml: "യോ", en: "yoo" },
            { ml: "യൗ", en: "yau" },
            { ml: "യം", en: "yam" },
            { ml: "യഃ", en: "yah" },
            { ml: "യ്", en: "ya" },
        ],
        examples: [
            { en: "yatra", ml: "യാത്ര", "en-meaning": "Journey" }
        ]
    },
    {
        ml: "ര",
        en: "ra",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "രാ", en: "raa" },
            { ml: "രി", en: "ri" },
            { ml: "രീ", en: "rii" },
            { ml: "രു", en: "ru" },
            { ml: "രൂ", en: "ruu" },
            { ml: "രൃ", en: "rru" },
            { ml: "രെ", en: "re" },
            { ml: "രേ", en: "ree" },
            { ml: "രൈ", en: "rai" },
            { ml: "രൊ", en: "ro" },
            { ml: "രോ", en: "roo" },
            { ml: "രൗ", en: "rau" },
            { ml: "രം", en: "ram" },
            { ml: "രഃ", en: "rah" },
            { ml: "ര്", en: "ra" },
        ],
        examples: [
            { en: "raja", ml: "രാജ", "en-meaning": "King" }
        ]
    },
    {
        ml: "ല",
        en: "la",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ലാ", en: "laa" },
            { ml: "ലി", en: "li" },
            { ml: "ലീ", en: "lii" },
            { ml: "ലു", en: "lu" },
            { ml: "ലൂ", en: "luu" },
            { ml: "ലൃ", en: "lru" },
            { ml: "ലെ", en: "le" },
            { ml: "ലേ", en: "lee" },
            { ml: "ലൈ", en: "lai" },
            { ml: "ലൊ", en: "lo" },
            { ml: "ലോ", en: "loo" },
            { ml: "ലൗ", en: "lau" },
            { ml: "ലം", en: "lam" },
            { ml: "ലഃ", en: "lah" },
            { ml: "ല്", en: "la" },
        ],
        examples: [
            { en: "latha", ml: "ലത", "en-meaning": "Creeper" }
        ]
    },
    {
        ml: "വ",
        en: "va",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "വാ", en: "vaa" },
            { ml: "വി", en: "vi" },
            { ml: "വീ", en: "vii" },
            { ml: "വു", en: "vu" },
            { ml: "വൂ", en: "vuu" },
            { ml: "വൃ", en: "vru" },
            { ml: "വെ", en: "ve" },
            { ml: "വേ", en: "vee" },
            { ml: "വൈ", en: "vai" },
            { ml: "വൊ", en: "vo" },
            { ml: "വോ", en: "voo" },
            { ml: "വൗ", en: "vau" },
            { ml: "വം", en: "vam" },
            { ml: "വഃ", en: "vah" },
            { ml: "വ്", en: "va" },
        ],
        examples: [
            { en: "vayu", ml: "വായു", "en-meaning": "Wind" }
        ]
    },
    {
        ml: "ശ",
        en: "śa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ശാ", en: "śaa" },
            { ml: "ശി", en: "śi" },
            { ml: "ശീ", en: "śii" },
            { ml: "ശു", en: "śu" },
            { ml: "ശൂ", en: "śuu" },
            { ml: "ശൃ", en: "śru" },
            { ml: "ശെ", en: "śe" },
            { ml: "ശേ", en: "śee" },
            { ml: "ശൈ", en: "śai" },
            { ml: "ശൊ", en: "śo" },
            { ml: "ശോ", en: "śoo" },
            { ml: "ശൗ", en: "śau" },
            { ml: "ശം", en: "śam" },
            { ml: "ശഃ", en: "śah" },
            { ml: "ശ്", en: "sha" },
        ],
        examples: [
            { en: "śakti", ml: "ശക്തി", "en-meaning": "Power" }
        ]
    },
    {
        ml: "ഷ",
        en: "ṣa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ഷാ", en: "ṣaa" },
            { ml: "ഷി", en: "ṣi" },
            { ml: "ഷീ", en: "ṣii" },
            { ml: "ഷു", en: "ṣu" },
            { ml: "ഷൂ", en: "ṣuu" },
            { ml: "ഷൃ", en: "ṣru" },
            { ml: "ഷെ", en: "ṣe" },
            { ml: "ഷേ", en: "ṣee" },
            { ml: "ഷൈ", en: "ṣai" },
            { ml: "ഷൊ", en: "ṣo" },
            { ml: "ഷോ", en: "ṣoo" },
            { ml: "ഷൗ", en: "ṣau" },
            { ml: "ഷം", en: "ṣam" },
            { ml: "ഷഃ", en: "ṣah" },
            { ml: "ഷ്", en: "sha" },
        ],
        examples: [
            { en: "ṣaṣ", ml: "ഷഷ്", "en-meaning": "Six" }
        ]
    },
    {
        ml: "സ",
        en: "sa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "സാ", en: "saa" },
            { ml: "സി", en: "si" },
            { ml: "സീ", en: "sii" },
            { ml: "സു", en: "su" },
            { ml: "സൂ", en: "suu" },
            { ml: "സൃ", en: "sru" },
            { ml: "സെ", en: "se" },
            { ml: "സേ", en: "see" },
            { ml: "സൈ", en: "sai" },
            { ml: "സൊ", en: "so" },
            { ml: "സോ", en: "soo" },
            { ml: "സൗ", en: "sau" },
            { ml: "സം", en: "sam" },
            { ml: "സഃ", en: "sah" },
            { ml: "സ്", en: "sa" },
        ],
        examples: [
            { en: "surya", ml: "സൂര്യ", "en-meaning": "Sun" }
        ]
    },
    {
        ml: "ഹ",
        en: "ha",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ഹാ", en: "haa" },
            { ml: "ഹി", en: "hi" },
            { ml: "ഹീ", en: "hii" },
            { ml: "ഹു", en: "hu" },
            { ml: "ഹൂ", en: "huu" },
            { ml: "ഹൃ", en: "hru" },
            { ml: "ഹെ", en: "he" },
            { ml: "ഹേ", en: "hee" },
            { ml: "ഹൈ", en: "hai" },
            { ml: "ഹൊ", en: "ho" },
            { ml: "ഹോ", en: "hoo" },
            { ml: "ഹൗ", en: "hau" },
            { ml: "ഹം", en: "ham" },
            { ml: "ഹഃ", en: "hah" },
            { ml: "ഹ്", en: "ha" },
        ],
        examples: [
            { en: "hansa", ml: "ഹംസ", "en-meaning": "Swan" }
        ]
    },
    {
        ml: "ള",
        en: "ḷa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ളാ", en: "ḷaa" },
            { ml: "ളി", en: "ḷi" },
            { ml: "ളീ", en: "ḷii" },
            { ml: "ളു", en: "ḷu" },
            { ml: "ളൂ", en: "ḷuu" },
            { ml: "ളൃ", en: "ḷru" },
            { ml: "ളെ", en: "ḷe" },
            { ml: "ളേ", en: "ḷee" },
            { ml: "ളൈ", en: "ḷai" },
            { ml: "ളൊ", en: "ḷo" },
            { ml: "ളോ", en: "ḷoo" },
            { ml: "ളൗ", en: "ḷau" },
            { ml: "ളം", en: "ḷam" },
            { ml: "ളഃ", en: "ḷah" },
            { ml: "ള്", en: "lla" },
        ],
        examples: [
            { en: "ḷaksha", ml: "ളക്ഷ", "en-meaning": "Target" }
        ]
    },
    {
        ml: "ഴ",
        en: "ḻa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "ഴാ", en: "ḻaa" },
            { ml: "ഴി", en: "ḻi" },
            { ml: "ഴീ", en: "ḻii" },
            { ml: "ഴു", en: "ḻu" },
            { ml: "ഴൂ", en: "ḻuu" },
            { ml: "ഴൃ", en: "ḻru" },
            { ml: "ഴെ", en: "ḻe" },
            { ml: "ഴേ", en: "ḻee" },
            { ml: "ഴൈ", en: "ḻai" },
            { ml: "ഴൊ", en: "ḻo" },
            { ml: "ഴോ", en: "ḻoo" },
            { ml: "ഴൗ", en: "ḻau" },
            { ml: "ഴം", en: "ḻam" },
            { ml: "ഴഃ", en: "ḻah" },
            { ml: "ഴ്", en: "zha" },
        ],
        examples: [
            { en: "ḻala", ml: "ഴല", "en-meaning": "Wave" }
        ]
    },
    {
        ml: "റ",
        en: "ṟa",
        group: "Consonants",
        subgroup: "യ - Others",
        dependants: [
            { ml: "റാ", en: "ṟaa" },
            { ml: "റി", en: "ṟi" },
            { ml: "റീ", en: "ṟii" },
            { ml: "റു", en: "ṟu" },
            { ml: "റൂ", en: "ṟuu" },
            { ml: "റൃ", en: "ṟru" },
            { ml: "റെ", en: "ṟe" },
            { ml: "റേ", en: "ṟee" },
            { ml: "റൈ", en: "ṟai" },
            { ml: "റൊ", en: "ṟo" },
            { ml: "റോ", en: "ṟoo" },
            { ml: "റൗ", en: "ṟau" },
            { ml: "റം", en: "ṟam" },
            { ml: "റഃ", en: "ṟah" },
            { ml: "റ്", en: "rra" },
        ],
        examples: [
            { en: "ṟaṟa", ml: "ററ", "en-meaning": "Quick" }
        ]
    },
    {
        ml: "ൽ",
        en: "l",
        group: "Chillus",
        examples: [
            { en: "nil", ml: "നിൽ", "en-meaning": "Stand" }
        ]
    },
    {
        ml: "ൾ",
        en: "ḷ",
        group: "Chillus",
        examples: [
            { en: "kaḷ", ml: "കൾ", "en-meaning": "Times" }
        ]
    },
    {
        ml: "ൻ",
        en: "n",
        group: "Chillus",
        examples: [
            { en: "man", ml: "മൻ", "en-meaning": "Pride" }
        ]
    },
    {
        ml: "ർ",
        en: "r",
        group: "Chillus",
        examples: [
            { en: "par", ml: "പർ", "en-meaning": "Leaf" }
        ]
    },
    {
        ml: "ൺ",
        en: "n",
        group: "Chillus",
        examples: [
            { en: "kaṇ", ml: "കൺ", "en-meaning": "Eye" }
        ]
    },
    {
        ml: "ക്ക",
        en: "kka",
        group: "Double Letters",
        dependants: [
            { ml: "ക്കാ", en: "kkaa" },
            { ml: "ക്കി", en: "kki" },
            { ml: "ക്കീ", en: "kkii" },
            { ml: "ക്കു", en: "kku" },
            { ml: "ക്കൂ", en: "kkuu" },
            { ml: "ക്കെ", en: "kke" },
            { ml: "ക്കേ", en: "kkee" },
            { ml: "ക്കൈ", en: "kkai" },
            { ml: "ക്കൊ", en: "kko" },
            { ml: "ക്കോ", en: "kkoo" },
            { ml: "ക്കൗ", en: "kkau" },
            { ml: "ക്കം", en: "kkam" },
            { ml: "ക്കഃ", en: "kkah" },
            { ml: "ക്ക്", en: "kk" },
        ],
        examples: [
            { en: "pakka", ml: "പക്ക", "en-meaning": "Solid" }
        ]
    },
    {
        ml: "മ്മ",
        en: "mma",
        group: "Double Letters",
        dependants: [
            { ml: "മ്മാ", en: "mmaa" },
            { ml: "മ്മി", en: "mmi" },
            { ml: "മ്മീ", en: "mmii" },
            { ml: "മ്മു", en: "mmu" },
            { ml: "മ്മൂ", en: "mmuu" },
            { ml: "മ്മെ", en: "mme" },
            { ml: "മ്മേ", en: "mmee" },
            { ml: "മ്മൈ", en: "mmai" },
            { ml: "മ്മൊ", en: "mmo" },
            { ml: "മ്മോ", en: "mmoo" },
            { ml: "മ്മൗ", en: "mmau" },
            { ml: "മ്മം", en: "mmam" },
            { ml: "മ്മഃ", en: "mmah" },
            { ml: "മ്മ്", en: "mm" },
        ],
        examples: [
            { en: "sammanam", ml: "സമ്മാനം", "en-meaning": "Gift" }
        ]
    },
    {
        ml: "ത്ത",
        en: "tta",
        group: "Double Letters",
        dependants: [
            { ml: "ത്താ", en: "ttaa" },
            { ml: "ത്തി", en: "tti" },
            { ml: "ത്തീ", en: "ttii" },
            { ml: "ത്തു", en: "ttu" },
            { ml: "ത്തൂ", en: "ttuu" },
            { ml: "ത്തെ", en: "tte" },
            { ml: "ത്തേ", en: "ttee" },
            { ml: "ത്തൈ", en: "ttai" },
            { ml: "ത്തൊ", en: "tto" },
            { ml: "ത്തോ", en: "ttoo" },
            { ml: "ത്തൗ", en: "ttau" },
            { ml: "ത്തം", en: "ttam" },
            { ml: "ത്തഃ", en: "ttah" },
            { ml: "ത്ത്", en: "tth" },
        ],
        examples: [
            { en: "sathyam", ml: "സത്യo", "en-meaning": "Truth" }
        ]
    },
    {
        ml: "ന്ന",
        en: "nna",
        group: "Double Letters",
        dependants: [
            { ml: "ന്നാ", en: "nnaa" },
            { ml: "ന്നി", en: "nni" },
            { ml: "ന്നീ", en: "nnii" },
            { ml: "ന്നു", en: "nnu" },
            { ml: "ന്നൂ", en: "nnuu" },
            { ml: "ന്നെ", en: "nne" },
            { ml: "ന്നേ", en: "nnee" },
            { ml: "ന്നൈ", en: "nnai" },
            { ml: "ന്നൊ", en: "nno" },
            { ml: "ന്നോ", en: "nnoo" },
            { ml: "ന്നൗ", en: "nnau" },
            { ml: "ന്നം", en: "nnam" },
            { ml: "ന്നഃ", en: "nnah" },
            { ml: "ന്ന്", en: "nn" },
        ],
        examples: [
            { en: "pinna", ml: "പിന്ന", "en-meaning": "Later" }
        ]
    },
    {
        ml: "പ്പ",
        en: "ppa",
        group: "Double Letters",
        dependants: [
            { ml: "പ്പാ", en: "ppaa" },
            { ml: "പ്പി", en: "ppi" },
            { ml: "പ്പീ", en: "ppii" },
            { ml: "പ്പു", en: "ppu" },
            { ml: "പ്പൂ", en: "ppuu" },
            { ml: "പ്പെ", en: "ppe" },
            { ml: "പ്പേ", en: "ppee" },
            { ml: "പ്പൈ", en: "ppai" },
            { ml: "പ്പൊ", en: "ppo" },
            { ml: "പ്പോ", en: "ppoo" },
            { ml: "പ്പൗ", en: "ppau" },
            { ml: "പ്പം", en: "ppam" },
            { ml: "പ്പഃ", en: "ppah" },
            { ml: "പ്പ്", en: "pp" },
        ],
        examples: [
            { en: "appam", ml: "അപ്പം", "en-meaning": "Rice cake" }
        ]
    },
    {
        ml: "ല്ല",
        en: "lla",
        group: "Double Letters",
        dependants: [
            { ml: "ല്ലാ", en: "llaa" },
            { ml: "ല്ലി", en: "lli" },
            { ml: "ല്ലീ", en: "llii" },
            { ml: "ല്ലു", en: "llu" },
            { ml: "ല്ലൂ", en: "lluu" },
            { ml: "ല്ലൃ", en: "llru" },
            { ml: "ല്ലെ", en: "lle" },
            { ml: "ല്ലേ", en: "llee" },
            { ml: "ല്ലൈ", en: "llai" },
            { ml: "ല്ലൊ", en: "llo" },
            { ml: "ല്ലോ", en: "lloo" },
            { ml: "ല്ലൗ", en: "llau" },
            { ml: "ല്ലം", en: "llam" },
            { ml: "ല്ലഃ", en: "llah" },
            { ml: "ല്ല്", en: "ll" },
        ],
        examples: [
            { en: "vallam", ml: "വള്ളം", "en-meaning": "Boat" }
        ]
    },
    {
        ml: "ട്ട",
        en: "ṭṭa",
        group: "Double Letters",
        dependants: [
            { ml: "ട്ടാ", en: "ṭṭaa" },
            { ml: "ട്ടി", en: "ṭṭi" },
            { ml: "ട്ടീ", en: "ṭṭii" },
            { ml: "ട്ടു", en: "ṭṭu" },
            { ml: "ട്ടൂ", en: "ṭṭuu" },
            { ml: "ട്ടെ", en: "ṭṭe" },
            { ml: "ട്ടേ", en: "ṭṭee" },
            { ml: "ട്ടൈ", en: "ṭṭai" },
            { ml: "ട്ടൊ", en: "ṭṭo" },
            { ml: "ട്ടോ", en: "ṭṭoo" },
            { ml: "ട്ടൗ", en: "ṭṭau" },
            { ml: "ട്ടം", en: "ṭṭam" },
            { ml: "ട്ടഃ", en: "ṭṭah" },
            { ml: "ട്ട്", en: "tt" },
        ],
        examples: [
            { en: "kotta", ml: "കോട്ട", "en-meaning": "Fort" }
        ]
    },
    {
        ml: "ച്ച",
        en: "cca",
        group: "Double Letters",
        dependants: [
            { ml: "ച്ചാ", en: "ccaa" },
            { ml: "ച്ചി", en: "cci" },
            { ml: "ച്ചീ", en: "ccii" },
            { ml: "ച്ചു", en: "ccu" },
            { ml: "ച്ചൂ", en: "ccuu" },
            { ml: "ച്ചെ", en: "cce" },
            { ml: "ച്ചേ", en: "ccee" },
            { ml: "ച്ചൈ", en: "ccai" },
            { ml: "ച്ചൊ", en: "cco" },
            { ml: "ച്ചോ", en: "ccoo" },
            { ml: "ച്ചൗ", en: "ccau" },
            { ml: "ച്ചം", en: "ccam" },
            { ml: "ച്ചഃ", en: "ccah" },
            { ml: "ച്ച്", en: "cch" },
        ],
        examples: [
            { en: "vicharam", ml: "വിചാരം", "en-meaning": "Thought" }
        ]
    },
    {
        ml: "ണ്ണ",
        en: "ṇṇa",
        group: "Double Letters",
        dependants: [
            { ml: "ണ്ണാ", en: "ṇṇaa" },
            { ml: "ണ്ണി", en: "ṇṇi" },
            { ml: "ണ്ണീ", en: "ṇṇii" },
            { ml: "ണ്ണു", en: "ṇṇu" },
            { ml: "ണ്ണൂ", en: "ṇṇuu" },
            { ml: "ണ്ണെ", en: "ṇṇe" },
            { ml: "ണ്ണേ", en: "ṇṇee" },
            { ml: "ണ്ണൈ", en: "ṇṇai" },
            { ml: "ണ്ണൊ", en: "ṇṇo" },
            { ml: "ണ്ണോ", en: "ṇṇoo" },
            { ml: "ണ്ണൗ", en: "ṇṇau" },
            { ml: "ണ്ണം", en: "ṇṇam" },
            { ml: "ണ്ണഃ", en: "ṇṇah" },
            { ml: "ണ്ണ്", en: "nn" },
        ],
        examples: [
            { en: "panna", ml: "പണ്ണ", "en-meaning": "Ornament" }
        ]
    },
    {
        ml: "ക്ഷ",
        en: "ksha",
        group: "Double Letters",
        dependants: [
            { ml: "ക്ഷാ", en: "kshaa" },
            { ml: "ക്ഷി", en: "kshi" },
            { ml: "ക്ഷീ", en: "kshii" },
            { ml: "ക്ഷു", en: "kshu" },
            { ml: "ക്ഷൂ", en: "kshuu" },
            { ml: "ക്ഷെ", en: "kshe" },
            { ml: "ക്ഷേ", en: "kshee" },
            { ml: "ക്ഷൈ", en: "kshai" },
            { ml: "ക്ഷൊ", en: "ksho" },
            { ml: "ക്ഷോ", en: "kshoo" },
            { ml: "ക്ഷൗ", en: "kshau" },
            { ml: "ക്ഷം", en: "ksham" },
            { ml: "ക്ഷഃ", en: "kshah" },
            { ml: "ക്ഷ്", en: "ksh" },
        ],
        examples: [
            { en: "kshama", ml: "ക്ഷമ", "en-meaning": "Forgiveness" }
        ]
    },
    {
        ml: "",
        en: "",
        group: "Empty"
    }
];