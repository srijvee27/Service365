// ==============================================================================
// Service365 - Bangladesh Geographic & Coverage Data
// Official 8 Divisions & 64 Districts with Thanas / Upazilas & Zone Classifications
// ==============================================================================

export interface BangladeshDistrictData {
  name: string;
  bnName: string;
  division: string;
  zoneType: "INSIDE_DHAKA" | "DHAKA_SUBURB" | "OUTSIDE_DHAKA";
  deliveryTimeHours: number;
  areas: string[];
}

export const BANGLADESH_DIVISIONS = [
  { name: "Dhaka", bnName: "ঢাকা", code: "DHK" },
  { name: "Chattogram", bnName: "চট্টগ্রাম", code: "CTG" },
  { name: "Rajshahi", bnName: "রাজশাহী", code: "RAJ" },
  { name: "Khulna", bnName: "খুলনা", code: "KHL" },
  { name: "Barishal", bnName: "বরিশাল", code: "BAR" },
  { name: "Sylhet", bnName: "সিলেট", code: "SYL" },
  { name: "Rangpur", bnName: "রংপুর", code: "RNG" },
  { name: "Mymensingh", bnName: "ময়মনসিংহ", code: "MYM" },
];

export const BANGLADESH_DISTRICTS: BangladeshDistrictData[] = [
  // --- DHAKA DIVISION ---
  {
    name: "Dhaka City",
    bnName: "ঢাকা সিটি",
    division: "Dhaka",
    zoneType: "INSIDE_DHAKA",
    deliveryTimeHours: 24,
    areas: [
      "Dhanmondi", "Gulshan-1", "Gulshan-2", "Banani", "Uttara", "Mirpur",
      "Mohammadpur", "Motijheel", "Badda", "Bashundhara R/A", "Mohakhali",
      "Khilgaon", "Malibagh", "Rampura", "Tejgaon", "Farmgate", "Lalbagh",
      "Old Dhaka", "Paltan", "Shahbagh", "Jatrabari", "Demra", "Cantonment",
      "Kafrul", "Khilkhet", "Niketan", "Shantinagar", "Wari", "Keraniganj"
    ]
  },
  {
    name: "Gazipur",
    bnName: "গাজীপুর",
    division: "Dhaka",
    zoneType: "DHAKA_SUBURB",
    deliveryTimeHours: 36,
    areas: ["Gazipur Sadar", "Tongi", "Kaliakair", "Kapasia", "Sreepur", "Board Bazar", "Chowrasta"]
  },
  {
    name: "Narayanganj",
    bnName: "নারায়ণগঞ্জ",
    division: "Dhaka",
    zoneType: "DHAKA_SUBURB",
    deliveryTimeHours: 36,
    areas: ["Narayanganj Sadar", "Fatullah", "Siddhirganj", "Bandar", "Araihazar", "Sonargaon", "Rupganj"]
  },
  {
    name: "Savar",
    bnName: "সাভার",
    division: "Dhaka",
    zoneType: "DHAKA_SUBURB",
    deliveryTimeHours: 36,
    areas: ["Savar Bazar", "Ashulia", "EPZ", "Hemayetpur", "Baipail", "Dhamrai"]
  },
  {
    name: "Faridpur",
    bnName: "ফরিদপুর",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Faridpur Sadar", "Alfadanga", "Boalmari", "Bhanga", "Nagarkanda", "Madhukhali", "Sadarpur"]
  },
  {
    name: "Gopalganj",
    bnName: "গোপালগঞ্জ",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Gopalganj Sadar", "Kashiani", "Kotalipara", "Muksudpur", "Tungipara"]
  },
  {
    name: "Kishoreganj",
    bnName: "কিশোরগঞ্জ",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Kishoreganj Sadar", "Bhairab", "Bajitpur", "Katiadi", "Karimganj", "Kuliarchar", "Pakundia"]
  },
  {
    name: "Madaripur",
    bnName: "মাদারীপুর",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Madaripur Sadar", "Kalkini", "Rajoir", "Shibchar"]
  },
  {
    name: "Manikganj",
    bnName: "মানিকগঞ্জ",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Manikganj Sadar", "Singair", "Saturia", "Shivalaya", "Harirampur", "Ghior", "Daulatpur"]
  },
  {
    name: "Munshiganj",
    bnName: "মুন্সীগঞ্জ",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Munshiganj Sadar", "Sreenagar", "Sirajdikhan", "Louhajang", "Tongibari", "Gazaria"]
  },
  {
    name: "Narsingdi",
    bnName: "নরসিংদী",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Narsingdi Sadar", "Palash", "Belabo", "Monohardi", "Shibpur", "Raipura"]
  },
  {
    name: "Rajbari",
    bnName: "রাজবাড়ী",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Rajbari Sadar", "Goalanda", "Pangsha", "Baliakandi", "Kalukhali"]
  },
  {
    name: "Shariatpur",
    bnName: "শরীয়তপুর",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Shariatpur Sadar", "Damudya", "Naria", "Zajira", "Bhedarganj", "Gosairhat"]
  },
  {
    name: "Tangail",
    bnName: "টাঙ্গাইল",
    division: "Dhaka",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Tangail Sadar", "Mirzapur", "Ghatail", "Kalihati", "Madhupur", "Bhuapur", "Sakhipur", "Gopalpur"]
  },

  // --- CHATTOGRAM DIVISION ---
  {
    name: "Chattogram",
    bnName: "চট্টগ্রাম",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Agrabad", "GEC", "Nasirabad", "Halishahar", "Panchlaish", "Kotwali", "Chandgaon", "Khulshi", "Chawkbazar", "Muradpur", "Hathazari", "Sitakunda", "Patiya"]
  },
  {
    name: "Cox's Bazar",
    bnName: "কক্সবাজার",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 72,
    areas: ["Cox's Bazar Sadar", "Ramu", "Chakaria", "Teknaf", "Ukhia", "Maheshkhali", "Pekua", "Kutubdia"]
  },
  {
    name: "Cumilla",
    bnName: "কুমিল্লা",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Cumilla Adarsha Sadar", "Kandirpar", "Laksam", "Daudkandi", "Debidwar", "Burichang", "Chandina", "Chouddagram", "Barura"]
  },
  {
    name: "Brahmanbaria",
    bnName: "ব্রাহ্মণবাড়িয়া",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Brahmanbaria Sadar", "Ashuganj", "Sarail", "Kasba", "Nabinagar", "Bancharampur", "Nasirnagar", "Akhaura"]
  },
  {
    name: "Chandpur",
    bnName: "চাঁদপুর",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Chandpur Sadar", "Faridganj", "Hajiganj", "Matlab North", "Matlab South", "Shahrasti", "Kachua", "Haimchar"]
  },
  {
    name: "Feni",
    bnName: "ফেনী",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Feni Sadar", "Daganbhuiyan", "Chhagalnaiya", "Parshuram", "Fulgazi", "Sonagazi"]
  },
  {
    name: "Lakshmipur",
    bnName: "লক্ষ্মীপুর",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Lakshmipur Sadar", "Raipur", "Ramganj", "Ramgati", "Kamalnagar"]
  },
  {
    name: "Noakhali",
    bnName: "নোয়াখালী",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Maijdee", "Begumganj", "Chatkhil", "Companiganj", "Hatiya", "Senbagh", "Subarnachar", "Kabirhat"]
  },
  {
    name: "Bandarban",
    bnName: "বান্দরবান",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 72,
    areas: ["Bandarban Sadar", "Ruma", "Thanchi", "Lama", "Alikadam", "Naikhongchhari", "Rowangchhari"]
  },
  {
    name: "Khagrachhari",
    bnName: "খাগড়াছড়ি",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 72,
    areas: ["Khagrachhari Sadar", "Dighinala", "Panchhari", "Mahalchhari", "Matiranga", "Manikchhari", "Ramgarh"]
  },
  {
    name: "Rangamati",
    bnName: "রাঙ্গামাটি",
    division: "Chattogram",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 72,
    areas: ["Rangamati Sadar", "Kaptai", "Kawkhali", "Baghaichhari", "Barkal", "Langadu", "Rajasthali", "Juraichhari"]
  },

  // --- RAJSHAHI DIVISION ---
  {
    name: "Rajshahi",
    bnName: "রাজশাহী",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Rajshahi Sadar", "Boalia", "Motihar", "Rajpara", "Shah Makhdum", "Godagari", "Tanore", "Paba", "Bagmara", "Durgapur"]
  },
  {
    name: "Bogura",
    bnName: "বগুড়া",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Bogura Sadar", "Shatmatha", "Sherpur", "Shibganj", "Gabtali", "Dhunat", "Kahaloo", "Nandigram", "Sariakandi", "Sonatala", "Adamdighi"]
  },
  {
    name: "Pabna",
    bnName: "পাবনা",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Pabna Sadar", "Ishwardi", "Sujanagar", "Santhia", "Chatmohar", "Bhangura", "Faridpur", "Bera", "Atgharia"]
  },
  {
    name: "Sirajganj",
    bnName: "সিরাজগঞ্জ",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Sirajganj Sadar", "Shahjadpur", "Ullapara", "Belkuchi", "Kazipur", "Kamarkhanda", "Raiganj", "Tarash", "Chauhali"]
  },
  {
    name: "Naogaon",
    bnName: "নওগাঁ",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Naogaon Sadar", "Mohadevpur", "Patnitala", "Manda", "Dhamoirhat", "Badalgachhi", "Niamatpur", "Sapahar", "Raninagar", "Atrai", "Porsha"]
  },
  {
    name: "Natore",
    bnName: "নাটোর",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Natore Sadar", "Singra", "Baraigram", "Gurudaspur", "Lalpur", "Bagatipara", "Naldanga"]
  },
  {
    name: "Chapainawabganj",
    bnName: "চাঁপাইনবাবগঞ্জ",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Chapainawabganj Sadar", "Shibganj", "Gomastapur", "Nachole", "Bholahat"]
  },
  {
    name: "Joypurhat",
    bnName: "জয়পুরহাট",
    division: "Rajshahi",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Joypurhat Sadar", "Panchbibi", "Kalai", "Khetlal", "Akkelpur"]
  },

  // --- KHULNA DIVISION ---
  {
    name: "Khulna",
    bnName: "খুলনা",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Khulna Sadar", "Sonadanga", "Daulatpur", "Khalishpur", "Khan Jahan Ali", "Rupsha", "Dighalia", "Phultala", "Dumuria", "Paikgachha", "Batiaghata"]
  },
  {
    name: "Jashore",
    bnName: "যশোর",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Jashore Sadar", "Chougachha", "Sharsha", "Jhikargachha", "Manirampur", "Abhaynagar", "Bagherpara", "Keshabpur"]
  },
  {
    name: "Kushtia",
    bnName: "কুষ্টিয়া",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Kushtia Sadar", "Kumarkhali", "Mirpur", "Bheramara", "Daulatpur", "Khoksa"]
  },
  {
    name: "Bagerhat",
    bnName: "বাগেরহাট",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Bagerhat Sadar", "Mongla", "Morrelganj", "Sarankhola", "Rampal", "Kachua", "Fakirhat", "Chitalmari", "Mollahat"]
  },
  {
    name: "Satkhira",
    bnName: "সাতক্ষীরা",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Satkhira Sadar", "Kalaroa", "Tala", "Debhata", "Kaliganj", "Assasuni", "Shyamnagar"]
  },
  {
    name: "Chuadanga",
    bnName: "চুয়াডাঙ্গা",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Chuadanga Sadar", "Alamdanga", "Damurhuda", "Jibannagar"]
  },
  {
    name: "Jhenaidah",
    bnName: "ঝিনাইদহ",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Jhenaidah Sadar", "Kaliganj", "Kotchandpur", "Maheshpur", "Shailkupa", "Harinakundu"]
  },
  {
    name: "Magura",
    bnName: "মাগুরা",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Magura Sadar", "Sreepur", "Mohammadpur", "Shalikha"]
  },
  {
    name: "Meherpur",
    bnName: "মেহেরপুর",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Meherpur Sadar", "Gangni", "Mujibnagar"]
  },
  {
    name: "Narail",
    bnName: "নড়াইল",
    division: "Khulna",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Narail Sadar", "Lohagara", "Kalia"]
  },

  // --- BARISHAL DIVISION ---
  {
    name: "Barishal",
    bnName: "বরিশাল",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Barishal Sadar", "Bakerganj", "Babuganj", "Banaripara", "Gournadi", "Agailjhara", "Muladi", "Hizla", "Mehendiganj", "Wazirpur"]
  },
  {
    name: "Bhola",
    bnName: "ভোলা",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 72,
    areas: ["Bhola Sadar", "Daulatkhan", "Borhanuddin", "Lalmohan", "Char Fasson", "Tazumuddin", "Monpura"]
  },
  {
    name: "Jhalokati",
    bnName: "ঝালকাঠি",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Jhalokati Sadar", "Kathalia", "Nalchity", "Rajapur"]
  },
  {
    name: "Patuakhali",
    bnName: "পটুয়াখালী",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Patuakhali Sadar", "Bauphal", "Galachipa", "Dashmina", "Kalapara", "Mirzaganj", "Dumki", "Rangabali"]
  },
  {
    name: "Pirojpur",
    bnName: "পিরোজপুর",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Pirojpur Sadar", "Bhandaria", "Mathbaria", "Kawkhali", "Nazirpur", "Nesarabad", "Zianagar"]
  },
  {
    name: "Barguna",
    bnName: "বরগুনা",
    division: "Barishal",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Barguna Sadar", "Amtali", "Patharghata", "Betagi", "Bamna", "Taltali"]
  },

  // --- SYLHET DIVISION ---
  {
    name: "Sylhet",
    bnName: "সিলেট",
    division: "Sylhet",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Sylhet Sadar", "Zindabazar", "Amberkhana", "Upashahar", "South Surma", "Beanibazar", "Golapganj", "Zakiganj", "Kanaighat", "Fenchuganj", "Balaganj", "Biswanath", "Companiganj", "Gowainghat", "Jaintiapur"]
  },
  {
    name: "Moulvibazar",
    bnName: "মৌলভীবাজার",
    division: "Sylhet",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Moulvibazar Sadar", "Sreemangal", "Kamalganj", "Kulaura", "Barlekha", "Juri", "Rajnagar"]
  },
  {
    name: "Habiganj",
    bnName: "হবিগঞ্জ",
    division: "Sylhet",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Habiganj Sadar", "Nabiganj", "Madhabpur", "Chunarughat", "Bahubal", "Baniachang", "Lakhai", "Ajmiriganj", "Shayestaganj"]
  },
  {
    name: "Sunamganj",
    bnName: "সুনামগঞ্জ",
    division: "Sylhet",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Sunamganj Sadar", "Chhatak", "Jagannathpur", "Derai", "Tahirpur", "Dharampasha", "Jamalganj", "Shalla", "Bishwamvarpur", "Dowarabazar", "South Sunamganj"]
  },

  // --- RANGPUR DIVISION ---
  {
    name: "Rangpur",
    bnName: "রংপুর",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Rangpur Sadar", "Jajira", "Pirgachha", "Mithapukur", "Badarganj", "Gangachhara", "Kaunia", "Pirganj", "Taraganj"]
  },
  {
    name: "Dinajpur",
    bnName: "দিনাজপুর",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Dinajpur Sadar", "Birganj", "Birampur", "Biral", "Bochaganj", "Chirirbandar", "Fulbari", "Ghoraghat", "Hakimpur", "Kaharole", "Khansama", "Nawabganj", "Parbatipur"]
  },
  {
    name: "Gaibandha",
    bnName: "গাইবান্ধা",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Gaibandha Sadar", "Gobindaganj", "Sundarganj", "Palashbari", "Sadullapur", "Saghata", "Fulchhari"]
  },
  {
    name: "Kurigram",
    bnName: "কুড়িগ্রাম",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Kurigram Sadar", "Nageshwari", "Bhurungamari", "Ulipur", "Chilmari", "Rajarhat", "Roumari", "Char Rajibpur", "Phulbari"]
  },
  {
    name: "Lalmonirhat",
    bnName: "লালমনিরহাট",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Lalmonirhat Sadar", "Aditmari", "Kaliganj", "Hatibandha", "Patgram"]
  },
  {
    name: "Nilphamari",
    bnName: "নীলফামারী",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Nilphamari Sadar", "Saidpur", "Jaldhaka", "Kishoreganj", "Domar", "Dimla"]
  },
  {
    name: "Panchagarh",
    bnName: "পঞ্চগড়",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Panchagarh Sadar", "Debiganj", "Boda", "Atwari", "Tetulia"]
  },
  {
    name: "Thakurgaon",
    bnName: "ঠাকুরগাঁও",
    division: "Rangpur",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Thakurgaon Sadar", "Pirganj", "Ranisankail", "Baliadangi", "Haripur"]
  },

  // --- MYMENSINGH DIVISION ---
  {
    name: "Mymensingh",
    bnName: "ময়মনসিংহ",
    division: "Mymensingh",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Mymensingh Sadar", "Muktagachha", "Bhaluka", "Trishal", "Gaffargaon", "Fulbaria", "Haluaghat", "Gouripur", "Ishwarganj", "Nandail", "Phulpur", "Dhobaura", "Tara Khanda"]
  },
  {
    name: "Jamalpur",
    bnName: "জামালপুর",
    division: "Mymensingh",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Jamalpur Sadar", "Melandaha", "Islampur", "Dewanganj", "Sarishabari", "Madarganj", "Bakshiganj"]
  },
  {
    name: "Netrokona",
    bnName: "নেত্রকোণা",
    division: "Mymensingh",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Netrokona Sadar", "Kendua", "Mohanganj", "Durgapur", "Barhatta", "Purbadhala", "Atpara", "Kalmakanda", "Madan", "Khaliajuri"]
  },
  {
    name: "Sherpur",
    bnName: "শেরপুর",
    division: "Mymensingh",
    zoneType: "OUTSIDE_DHAKA",
    deliveryTimeHours: 48,
    areas: ["Sherpur Sadar", "Nalitabari", "Nakla", "Jhenaigati", "Sreebardi"]
  }
];

export function getDistrictByName(name: string) {
  return BANGLADESH_DISTRICTS.find(d => d.name.toLowerCase() === name.toLowerCase());
}

export function getZoneByDistrict(districtName: string): "INSIDE_DHAKA" | "DHAKA_SUBURB" | "OUTSIDE_DHAKA" {
  const d = getDistrictByName(districtName);
  return d ? d.zoneType : "OUTSIDE_DHAKA";
}
