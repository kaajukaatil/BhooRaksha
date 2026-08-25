// Safe Routing and Evacuation Corridors for Northeast India
// High-fidelity highway networks with realistic GIS coordinates, hazard choke points, and safe alternate routes

export const CORRIDORS = [
  {
    id: 'guwahati-shillong',
    name: 'Guwahati ➔ Shillong (Meghalaya)',
    state: 'Assam & Meghalaya',
    highway: 'NH-6 / GS Road Corridor',
    description: 'Vital hill corridor connecting Brahmaputra Valley to Khasi Hills. Prone to catastrophic mudslides and rockfalls near Sonapur and Umsning cuts during intense monsoons.',
    origin: { name: 'Guwahati Central', coords: [26.1584, 91.7458] },
    destination: { name: 'Shillong Peak Depot', coords: [25.5788, 91.8933] },
    relevantNodeIds: [14, 4, 5],
    routes: [
      {
        id: 'route-nh6-direct',
        name: 'Direct Route (NH-6 GS Highway)',
        type: 'danger',
        distanceKm: 98.4,
        normalDurationMin: 145,
        estimatedDelayMin: 180,
        slopeHazardScore: 84,
        clearanceRating: 'High Danger / Blockage Likely',
        color: '#ef4444',
        dashArray: null,
        elevationGainM: 1420,
        steepSlopeExposurePct: 68,
        description: 'Direct 4-lane hill cut passing through unstable shale rock faces with severe active rockfall hazards at KM 42 & KM 67.',
        status: 'CRITICAL HAZARD - RESTRICTED ACCESS',
        statusLevel: 'danger',
        coordinates: [
          [26.1584, 91.7458], // Guwahati
          [26.1120, 91.7850], // Khanapara
          [26.0420, 91.8320], // Jorabat junction
          [25.9680, 91.8750], // Burnihat hill cut
          [25.9010, 91.8900], // Nongpoh entry
          [25.8200, 91.8850], // Umsning steep scarp (Hazard Zone 1)
          [25.7350, 91.8920], // Sonapur rockfall zone (Hazard Zone 2)
          [25.6600, 91.9050], // Umiam Lake cut
          [25.5788, 91.8933]  // Shillong
        ],
        chokePoints: [
          { name: 'Sonapur High-Cut Scarp (KM 48)', coords: [25.7350, 91.8920], hazard: 'Debris flow & soft shale failure', riskLevel: 'Critical' },
          { name: 'Umsning Hill Incline (KM 62)', coords: [25.8200, 91.8850], hazard: 'Saturated soil slip across roadway', riskLevel: 'High' },
          { name: 'Umiam Dam Approach (KM 81)', coords: [25.6600, 91.9050], hazard: 'Rockfall on sharp hairpins', riskLevel: 'High' }
        ],
        shelters: []
      },
      {
        id: 'route-bhoirymbong-safe',
        name: 'AI Green Corridor (Bhoirymbong Ridge Bypass)',
        type: 'safe',
        distanceKm: 114.2,
        normalDurationMin: 175,
        estimatedDelayMin: 10,
        slopeHazardScore: 18,
        clearanceRating: 'Optimal Safe Green Corridor',
        color: '#10b981',
        dashArray: null,
        elevationGainM: 1180,
        steepSlopeExposurePct: 14,
        description: 'Engineered ridge-line bypass with reinforced concrete retaining walls, continuous subsurface geotextile drainage, and 24/7 SDRF clearance patrols.',
        status: 'SAFE GREEN CORRIDOR - ALL CLEAR',
        statusLevel: 'safe',
        coordinates: [
          [26.1584, 91.7458], // Guwahati
          [26.1120, 91.7850], // Khanapara
          [26.0550, 91.9400], // Byrnihat East Ridge
          [25.9800, 92.0100], // Umroi Valley bypass
          [25.8900, 92.0250], // Bhoirymbong Ridge Link
          [25.7800, 91.9950], // Mawlai North Crest
          [25.6950, 91.9450], // NEHU High Plateau
          [25.5788, 91.8933]  // Shillong
        ],
        chokePoints: [],
        shelters: [
          { name: 'Byrnihat Disaster Relief Hub', coords: [26.0550, 91.9400], capacity: 350, type: 'Medical & Logistics' },
          { name: 'Umroi Emergency Airfield Shelter', coords: [25.9800, 92.0100], capacity: 800, type: 'NDRF Staging Base' },
          { name: 'Bhoirymbong Community Evac Camp', coords: [25.8900, 92.0250], capacity: 500, type: 'Refuge & Food Hub' },
          { name: 'NEHU High Altitude Medical Camp', coords: [25.6950, 91.9450], capacity: 450, type: 'Trauma Care Unit' }
        ]
      },
      {
        id: 'route-mairang-detour',
        name: 'Secondary Contingency (Mairang Ridge Route)',
        type: 'contingency',
        distanceKm: 136.0,
        normalDurationMin: 215,
        estimatedDelayMin: 25,
        slopeHazardScore: 32,
        clearanceRating: 'Moderate Caution - Heavy Vehicle Clear',
        color: '#06b6d4',
        dashArray: '6, 6',
        elevationGainM: 1560,
        steepSlopeExposurePct: 24,
        description: 'Longer highland detour through West Khasi ridge. All-weather reinforced macadam suitable for heavy evacuation trucks and fuel tankers.',
        status: 'MONITORED CONTINGENCY ROUTE',
        statusLevel: 'caution',
        coordinates: [
          [26.1584, 91.7458], // Guwahati
          [26.1100, 91.6800], // Rani Reserve Foothill
          [25.9700, 91.6400], // Nongstoin North Spur
          [25.8300, 91.6700], // Kynshi Plateau
          [25.7200, 91.7400], // Mairang Highland Junction
          [25.6300, 91.8100], // Mawphlang Crest
          [25.5788, 91.8933]  // Shillong
        ],
        chokePoints: [
          { name: 'Mairang Hairpin KM 84', coords: [25.7200, 91.7400], hazard: 'Minor surface runoff during monsoon', riskLevel: 'Moderate' }
        ],
        shelters: [
          { name: 'Rani Civil Defense Post', coords: [26.1100, 91.6800], capacity: 250, type: 'Emergency Checkpoint' },
          { name: 'Mairang District Evac Center', coords: [25.7200, 91.7400], capacity: 600, type: 'Relief & Power Depot' }
        ]
      }
    ]
  },
  {
    id: 'dimapur-kohima',
    name: 'Dimapur ➔ Kohima (Nagaland)',
    state: 'Nagaland',
    highway: 'NH-29 Hill Expressway',
    description: 'Crucial lifeline connecting Dimapur plains to Kohima capital. Chronic landslide sinkholes at Dzüdza river gorge and Pagla Pahar with high clay expansion.',
    origin: { name: 'Dimapur Logistics Hub', coords: [25.9068, 93.7274] },
    destination: { name: 'Kohima Civil HQ', coords: [25.6751, 94.1086] },
    relevantNodeIds: [1, 2, 17],
    routes: [
      {
        id: 'route-nh29-direct',
        name: 'Direct Route (NH-29 Dzüdza Sinking Zone)',
        type: 'danger',
        distanceKm: 74.5,
        normalDurationMin: 120,
        estimatedDelayMin: 240,
        slopeHazardScore: 92,
        clearanceRating: 'Critical Landslide Zone / Impassable',
        color: '#ef4444',
        dashArray: null,
        elevationGainM: 1350,
        steepSlopeExposurePct: 76,
        description: 'Direct valley road severely degraded by slope toe erosion and deep-seated subsidence at Dzüdza bridge approach.',
        status: 'ROADWAY BLOCKED / HAZARDOUS DEBRIS',
        statusLevel: 'danger',
        coordinates: [
          [25.9068, 93.7274], // Dimapur
          [25.8600, 93.7900], // Chumukedima Gate
          [25.8100, 93.8600], // Pagla Pahar Gorge (Hazard Zone 1)
          [25.7600, 93.9300], // Dzüdza River Sinking Zone (Hazard Zone 2)
          [25.7100, 94.0200], // Zubza Hill Incline (Hazard Zone 3)
          [25.6751, 94.1086]  // Kohima
        ],
        chokePoints: [
          { name: 'Pagla Pahar Canyon (KM 18)', coords: [25.8100, 93.8600], hazard: 'Overhead boulder fall and flash torrents', riskLevel: 'Critical' },
          { name: 'Dzüdza Sinking Segment (KM 34)', coords: [25.7600, 93.9300], hazard: 'Pavement shear fracture & active slope sliding', riskLevel: 'Critical' },
          { name: 'Zubza Hairpins (KM 52)', coords: [25.7100, 94.0200], hazard: 'Mud slump across all lanes', riskLevel: 'High' }
        ],
        shelters: []
      },
      {
        id: 'route-niuland-safe',
        name: 'AI Green Corridor (Niuland - Zhadima Ridge Link)',
        type: 'safe',
        distanceKm: 92.0,
        normalDurationMin: 150,
        estimatedDelayMin: 15,
        slopeHazardScore: 21,
        clearanceRating: 'Optimal Safe Green Corridor',
        color: '#10b981',
        dashArray: null,
        elevationGainM: 1040,
        steepSlopeExposurePct: 18,
        description: 'Contour-graded ridge highway bypassing steep river ravines. Protected by Gabion retaining walls and continuous drainage channels.',
        status: 'SAFE GREEN CORRIDOR - ALL CLEAR',
        statusLevel: 'safe',
        coordinates: [
          [25.9068, 93.7274], // Dimapur
          [25.9400, 93.8300], // Niuland Plains
          [25.8900, 93.9500], // Ghotovi Ridge
          [25.8200, 94.0400], // Zhadima Plateau Bypass
          [25.7500, 94.0800], // Meriema North Gate
          [25.6751, 94.1086]  // Kohima
        ],
        chokePoints: [],
        shelters: [
          { name: 'Niuland Emergency Supply Hub', coords: [25.9400, 93.8300], capacity: 400, type: 'Civil Supplies & Fuel' },
          { name: 'Zhadima Evacuation Shelter', coords: [25.8200, 94.0400], capacity: 600, type: 'Medical & Bedded Shelter' },
          { name: 'Meriema Disaster Response Camp', coords: [25.7500, 94.0800], capacity: 350, type: 'Assam Rifles Support Base' }
        ]
      },
      {
        id: 'route-peducha-contingency',
        name: 'Secondary Contingency (Peducha - Tsiesema Detour)',
        type: 'contingency',
        distanceKm: 84.0,
        normalDurationMin: 140,
        estimatedDelayMin: 35,
        slopeHazardScore: 38,
        clearanceRating: 'Moderate Risk - Escort Required',
        color: '#06b6d4',
        dashArray: '6, 6',
        elevationGainM: 1200,
        steepSlopeExposurePct: 29,
        description: 'Alternate link route across stable basalt ridge. Recommended for light emergency vehicles and medical response convoys.',
        status: 'OPEN WITH CONVOY ESCORT',
        statusLevel: 'caution',
        coordinates: [
          [25.9068, 93.7274], // Dimapur
          [25.8400, 93.8100], // Medziphema Town
          [25.7900, 93.9100], // Peducha East Link
          [25.7300, 94.0500], // Tsiesema High Junction
          [25.6751, 94.1086]  // Kohima
        ],
        chokePoints: [
          { name: 'Peducha Step Slope (KM 29)', coords: [25.7900, 93.9100], hazard: 'Minor gravel sloughing during heavy rain', riskLevel: 'Moderate' }
        ],
        shelters: [
          { name: 'Medziphema Veterinary College Camp', coords: [25.8400, 93.8100], capacity: 500, type: 'Shelter & Helipad' }
        ]
      }
    ]
  },
  {
    id: 'siliguri-gangtok',
    name: 'Siliguri ➔ Gangtok (Sikkim)',
    state: 'West Bengal & Sikkim',
    highway: 'NH-10 Himalayan Life Corridor',
    description: 'Single primary artery connecting Sikkim to rest of India. Running parallel to turbulent Teesta River, extremely vulnerable to rockfalls at 29th Mile, Birik Dara, and Teesta Bazaar.',
    origin: { name: 'Siliguri North Junction', coords: [26.7271, 88.3953] },
    destination: { name: 'Gangtok Emergency Station', coords: [27.3389, 88.6065] },
    relevantNodeIds: [12, 13],
    routes: [
      {
        id: 'route-nh10-direct',
        name: 'Direct Route (NH-10 Teesta River Cut)',
        type: 'danger',
        distanceKm: 114.0,
        normalDurationMin: 210,
        estimatedDelayMin: 360,
        slopeHazardScore: 96,
        clearanceRating: 'Critical Slope Failure / Impassable',
        color: '#ef4444',
        dashArray: null,
        elevationGainM: 1650,
        steepSlopeExposurePct: 82,
        description: 'Vulnerable riverbed alignment prone to continuous rock bursts and high water level submergence at 29th Mile.',
        status: 'RED ALERT - HIGH ROCKFALL & SLIDE RISK',
        statusLevel: 'danger',
        coordinates: [
          [26.7271, 88.3953], // Siliguri
          [26.8500, 88.4700], // Sevoke Coronation Bridge
          [26.9600, 88.4900], // 29th Mile Hazard Cut
          [27.0600, 88.4300], // Teesta Bazaar Sinking Zone
          [27.1700, 88.5300], // Rangpo Border Checkpost
          [27.2400, 88.5800], // Singtam Valley
          [27.3389, 88.6065]  // Gangtok
        ],
        chokePoints: [
          { name: '29th Mile Active Rockfall (KM 32)', coords: [26.9600, 88.4900], hazard: 'Continuous boulder bombardment from 80° scarp', riskLevel: 'Critical' },
          { name: 'Teesta Bazaar Submergence (KM 49)', coords: [27.0600, 88.4300], hazard: 'Riverbank erosion & liquefaction', riskLevel: 'Critical' },
          { name: 'Rangpo Chasm (KM 74)', coords: [27.1700, 88.5300], hazard: 'Active hill slide during rainfall > 20mm/hr', riskLevel: 'High' }
        ],
        shelters: []
      },
      {
        id: 'route-lava-safe',
        name: 'AI Green Corridor (Gorubathan - Lava - Rhenock Safe Bypass)',
        type: 'safe',
        distanceKm: 148.0,
        normalDurationMin: 260,
        estimatedDelayMin: 15,
        slopeHazardScore: 19,
        clearanceRating: 'Optimal Safe Green Corridor',
        color: '#10b981',
        dashArray: null,
        elevationGainM: 1820,
        steepSlopeExposurePct: 15,
        description: 'High-elevation stabilized ridge route bypassing Teesta canyon completely. Heavy steel catch nets and paved runoff channels.',
        status: 'SAFE GREEN CORRIDOR - ALL CLEAR',
        statusLevel: 'safe',
        coordinates: [
          [26.7271, 88.3953], // Siliguri
          [26.8600, 88.6800], // Damdim Junction
          [26.9700, 88.7000], // Gorubathan Plains
          [27.0800, 88.6600], // Lava Pine Ridge
          [27.1600, 88.6400], // Rhenock Border Station
          [27.2200, 88.6300], // Pakyong Airport Plateau
          [27.3389, 88.6065]  // Gangtok
        ],
        chokePoints: [],
        shelters: [
          { name: 'Gorubathan BRO Emergency Depot', coords: [26.9700, 88.7000], capacity: 550, type: 'Logistics & Heavy Equipment' },
          { name: 'Lava High Ridge Relief Base', coords: [27.0800, 88.6600], capacity: 400, type: 'Medical & Warm Shelter' },
          { name: 'Pakyong Airport Emergency Medical Center', coords: [27.2200, 88.6300], capacity: 900, type: 'Major Trauma & Airlift Base' }
        ]
      },
      {
        id: 'route-melli-contingency',
        name: 'Secondary Contingency (Melli - Jorethang - Namchi Route)',
        type: 'contingency',
        distanceKm: 132.0,
        normalDurationMin: 235,
        estimatedDelayMin: 30,
        slopeHazardScore: 36,
        clearanceRating: 'Moderate Caution - Light Vehicles',
        color: '#06b6d4',
        dashArray: '6, 6',
        elevationGainM: 1450,
        steepSlopeExposurePct: 28,
        description: 'Alternative South Sikkim route passing through stabilized tea estate slopes and Namchi ridge.',
        status: 'OPEN FOR LIGHT RESPONSE VEHICLES',
        statusLevel: 'caution',
        coordinates: [
          [26.7271, 88.3953], // Siliguri
          [26.8200, 88.4200], // Sukna Foothills
          [26.9800, 88.3500], // Mirik Ridge Link
          [27.1200, 88.3100], // Jorethang Valley Bridge
          [27.1700, 88.3500], // Namchi High Ridge
          [27.2700, 88.5100], // Singtam West
          [27.3389, 88.6065]  // Gangtok
        ],
        chokePoints: [
          { name: 'Jorethang River Approach (KM 61)', coords: [27.1200, 88.3100], hazard: 'Waterlogging during torrential storms', riskLevel: 'Moderate' }
        ],
        shelters: [
          { name: 'Namchi District Emergency Hub', coords: [27.1700, 88.3500], capacity: 650, type: 'SDRF Command Post' }
        ]
      }
    ]
  },
  {
    id: 'silchar-aizawl',
    name: 'Silchar ➔ Aizawl (Mizoram)',
    state: 'Assam & Mizoram',
    highway: 'NH-306 National Highway',
    description: 'Primary supply lifeline into Mizoram hill capital. Deep shale rock strata susceptible to extensive rotational slides and structural subsidence.',
    origin: { name: 'Silchar Supply Depot', coords: [24.8333, 92.7789] },
    destination: { name: 'Aizawl Emergency Operations', coords: [23.7271, 92.7176] },
    relevantNodeIds: [6, 7, 8],
    routes: [
      {
        id: 'route-nh306-direct',
        name: 'Direct Route (NH-306 Kolasib Mountain Cut)',
        type: 'danger',
        distanceKm: 172.0,
        normalDurationMin: 330,
        estimatedDelayMin: 300,
        slopeHazardScore: 91,
        clearanceRating: 'Extreme Landslide Danger',
        color: '#ef4444',
        dashArray: null,
        elevationGainM: 1280,
        steepSlopeExposurePct: 74,
        description: 'Vulnerable soft-sandstone mountain cuttings between Vairengte and Kolasib with active rotational slip faults.',
        status: 'RED ALERT - HIGH ROADWAY SLIP RISK',
        statusLevel: 'danger',
        coordinates: [
          [24.8333, 92.7789], // Silchar
          [24.6200, 92.7500], // Sonabarighat
          [24.5100, 92.7600], // Vairengte Border Pass (Hazard 1)
          [24.2200, 92.6800], // Kolasib Hill Saddle (Hazard 2)
          [23.9500, 92.6600], // Sairang River Gorge (Hazard 3)
          [23.7271, 92.7176]  // Aizawl
        ],
        chokePoints: [
          { name: 'Vairengte Hill Pass (KM 38)', coords: [24.5100, 92.7600], hazard: 'Soil sloughing & unstable highway edge', riskLevel: 'Critical' },
          { name: 'Kolasib North Slope (KM 88)', coords: [24.2200, 92.6800], hazard: 'Major rotational hill slump', riskLevel: 'Critical' }
        ],
        shelters: []
      },
      {
        id: 'route-darlawn-safe',
        name: 'AI Green Corridor (Bilkhawthlir - Darlawn Ridge Route)',
        type: 'safe',
        distanceKm: 198.0,
        normalDurationMin: 370,
        estimatedDelayMin: 20,
        slopeHazardScore: 23,
        clearanceRating: 'Optimal Safe Green Corridor',
        color: '#10b981',
        dashArray: null,
        elevationGainM: 1120,
        steepSlopeExposurePct: 19,
        description: 'Stabilized eastern ridge route traversing hard quartzite strata with hydro-seeded slope embankments and SDRF patrols.',
        status: 'SAFE GREEN CORRIDOR - ALL CLEAR',
        statusLevel: 'safe',
        coordinates: [
          [24.8333, 92.7789], // Silchar
          [24.5800, 92.8900], // Bagha Bypass
          [24.3200, 92.9300], // Bilkhawthlir East Crest
          [24.0800, 92.9100], // Darlawn Highland Ridge
          [23.8500, 92.8400], // Sihphir North Summit
          [23.7271, 92.7176]  // Aizawl
        ],
        chokePoints: [],
        shelters: [
          { name: 'Bilkhawthlir Relief Center', coords: [24.3200, 92.9300], capacity: 450, type: 'Civil Defense Base' },
          { name: 'Darlawn Community Evacuation Shelter', coords: [24.0800, 92.9100], capacity: 600, type: 'Medical & Logistics' },
          { name: 'Sihphir Emergency First Aid Station', coords: [23.8500, 92.8400], capacity: 350, type: 'Trauma Point' }
        ]
      }
    ]
  },
  {
    id: 'itanagar-pasighat',
    name: 'Itanagar ➔ Pasighat (Arunachal Pradesh)',
    state: 'Arunachal Pradesh',
    highway: 'Trans-Arunachal Highway / NH-415',
    description: 'Key eastern Himalayan transport spine. Subject to severe monsoonal flash mudflows and river toe scouring.',
    origin: { name: 'Itanagar Capital Hub', coords: [27.0844, 93.6053] },
    destination: { name: 'Pasighat Emergency HQ', coords: [28.0667, 95.3333] },
    relevantNodeIds: [9, 10, 11],
    routes: [
      {
        id: 'route-nh415-direct',
        name: 'Direct Route (NH-415 Hill Cut)',
        type: 'danger',
        distanceKm: 258.0,
        normalDurationMin: 420,
        estimatedDelayMin: 240,
        slopeHazardScore: 86,
        clearanceRating: 'Heavy Slip & Mudflow Warning',
        color: '#ef4444',
        dashArray: null,
        elevationGainM: 1540,
        steepSlopeExposurePct: 62,
        description: 'Direct mountain highway along fragile outer Himalayan Siwalik sandstone with ongoing debris avalanches.',
        status: 'HIGH SLIDE RISK - TRAVEL WITH CAUTION',
        statusLevel: 'danger',
        coordinates: [
          [27.0844, 93.6053], // Itanagar
          [27.1500, 93.8500], // Nirjuli Hill Pass (Hazard 1)
          [27.3500, 94.2000], // Lower Subansiri Cut (Hazard 2)
          [27.6000, 94.6500], // Likabali Hill Choke
          [27.8500, 95.0000], // Silapathar Foothill
          [28.0667, 95.3333]  // Pasighat
        ],
        chokePoints: [
          { name: 'Nirjuli Overhang (KM 22)', coords: [27.1500, 93.8500], hazard: 'Soft mud sliding onto roadway', riskLevel: 'Critical' },
          { name: 'Subansiri Valley Pass (KM 76)', coords: [27.3500, 94.2000], hazard: 'Slope undercut by river torrent', riskLevel: 'High' }
        ],
        shelters: []
      },
      {
        id: 'route-foothill-safe',
        name: 'AI Green Corridor (Trans-Arunachal Foothill Expressway)',
        type: 'safe',
        distanceKm: 282.0,
        normalDurationMin: 440,
        estimatedDelayMin: 15,
        slopeHazardScore: 16,
        clearanceRating: 'Optimal Safe Green Corridor',
        color: '#10b981',
        dashArray: null,
        elevationGainM: 780,
        steepSlopeExposurePct: 12,
        description: 'Stabilized valley-floor corridor protected by flood levees and heavy boulder revetments away from unstable hill cuts.',
        status: 'SAFE GREEN CORRIDOR - ALL CLEAR',
        statusLevel: 'safe',
        coordinates: [
          [27.0844, 93.6053], // Itanagar
          [26.9800, 93.7500], // Banderdewa Plains Bypass
          [27.1000, 94.1500], // Gohpur South Expressway
          [27.3800, 94.6000], // North Lakhimpur Corridor
          [27.7500, 94.9500], // Dhemaji Valley Route
          [28.0667, 95.3333]  // Pasighat
        ],
        chokePoints: [],
        shelters: [
          { name: 'Banderdewa Civil Logistics Depot', coords: [26.9800, 93.7500], capacity: 500, type: 'Refueling & Evac Hub' },
          { name: 'North Lakhimpur Medical & Airbase Center', coords: [27.3800, 94.6000], capacity: 1200, type: 'Major Multi-Specialty Hospital' },
          { name: 'Dhemaji Flood & Slide Relief Depot', coords: [27.7500, 94.9500], capacity: 600, type: 'NDRF Supply Camp' }
        ]
      }
    ]
  }
]

export const ALL_EMERGENCY_RESOURCES = [
  { name: 'NDRF 1st Battalion Guwahati', lat: 26.12, lon: 91.80, type: 'NDRF Base', units: 8, phone: '1070 / 0361-2237000' },
  { name: 'SDRF Shillong Emergency Unit', lat: 25.56, lon: 91.87, type: 'SDRF Base', units: 5, phone: '1077 / 0364-2502098' },
  { name: 'Assam Rifles Rescue Station Kohima', lat: 25.68, lon: 94.12, type: 'Military SAR', units: 6, phone: '0370-2244222' },
  { name: 'BRO Project Swastik Gangtok', lat: 27.32, lon: 88.61, type: 'Heavy Clearance', units: 12, phone: '03592-202450' },
  { name: 'Mizoram Disaster Management Aizawl', lat: 23.73, lon: 92.72, type: 'Disaster HQ', units: 4, phone: '0389-2334005' },
  { name: 'Arunachal SDRF Unit Itanagar', lat: 27.09, lon: 93.61, type: 'SDRF Base', units: 5, phone: '0360-2212263' }
]
