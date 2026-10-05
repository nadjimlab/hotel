import { generateUuid, hashPassword } from '../utils/crypto.ts';
import { getDb, query } from './index.ts';
import { runMigrations } from './migrate.ts';

export async function runSeed() {
  console.log('🌱 Seeding PostgreSQL database for La Gazelle d\'Or Resort & Spa...');

  // Ensure migrations are run first
  await runMigrations();

  const db = await getDb();

  await db.transaction(async (tx) => {
    // 1. Seed Users (Admin & Staff)
    const adminId = generateUuid();
    const staffId = generateUuid();
    const guestId = generateUuid();

    await tx.query(`
      INSERT INTO users (id, email, password_hash, role, name)
      VALUES 
        ($1, 'admin@hotel-lagazelledor.dz', $2, 'admin', 'Direction Générale'),
        ($3, 'reception@hotel-lagazelledor.dz', $4, 'staff', 'Chef de Réception'),
        ($5, 'client.test@example.com', $6, 'guest', 'Karim Benali')
      ON CONFLICT (email) DO NOTHING;
    `, [
      adminId, hashPassword('Gazelle2026!'),
      staffId, hashPassword('Staff2026!'),
      guestId, hashPassword('Client2026!')
    ]);

    // 2. Seed Amenities
    const amenities = [
      { id: generateUuid(), code: 'wifi', name_fr: 'Wi-Fi Haut Débit Gratuit', name_ar: 'واي فاي فائق السرعة مجاني', name_en: 'High-Speed Free Wi-Fi', icon_name: 'Wifi' },
      { id: generateUuid(), code: 'ac', name_fr: 'Climatisation Silencieuse', name_ar: 'تكييف هواء هادئ', name_en: 'Silent Climate Control', icon_name: 'Wind' },
      { id: generateUuid(), code: 'pool', name_fr: 'Accès Piscines Oasis', name_ar: 'دخول مسابح الواحة', name_en: 'Oasis Pools Access', icon_name: 'Waves' },
      { id: generateUuid(), code: 'spa', name_fr: 'Accès Spa & Hammam 2500m²', name_ar: 'دخول السبا والحمام الحراري', name_en: 'Spa & Thermal Hammam Access', icon_name: 'Sparkles' },
      { id: generateUuid(), code: 'terrace', name_fr: 'Terrasse Vue Dunes & Palmeraie', name_ar: 'شرفة بإطلالة على الكثبان والنخيل', name_en: 'Dune & Palm Grove Terrace', icon_name: 'Sun' },
      { id: generateUuid(), code: 'breakfast', name_fr: 'Petit Déjeuner Buffet Inclus', name_ar: 'إفطار بوفيه فاخر مشمول', name_en: 'Buffet Breakfast Included', icon_name: 'Coffee' },
      { id: generateUuid(), code: 'shuttle', name_fr: 'Navette Aéroport Guemar Gratuite', name_ar: 'نقل مجاني من مطار قمار', name_en: 'Complimentary Airport Shuttle', icon_name: 'Plane' },
      { id: generateUuid(), code: 'minibar', name_fr: 'Plateau Thé Saharien & Minibar', name_ar: 'ضيافة الشاي الصحراوي والميني بار', name_en: 'Saharan Tea Set & Minibar', icon_name: 'CupSoda' },
    ];

    for (const a of amenities) {
      await tx.query(`
        INSERT INTO amenities (id, code, name_fr, name_ar, name_en, icon_name)
        VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (code) DO UPDATE SET 
          name_fr = EXCLUDED.name_fr,
          name_ar = EXCLUDED.name_ar,
          name_en = EXCLUDED.name_en;
      `, [a.id, a.code, a.name_fr, a.name_ar, a.name_en, a.icon_name]);
    }

    // 3. Seed Room Types
    const roomTypes = [
      { id: generateUuid(), code: 'hotel_room', name_fr: 'Chambre Deluxe d\'Hôtel', name_ar: 'غرفة ديلوكس فندقية', name_en: 'Hotel Deluxe Room' },
      { id: generateUuid(), code: 'bungalow', name_fr: 'Bungalow Saharien', name_ar: 'بنغالو صحراوي فاخر', name_en: 'Saharan Bungalow' },
      { id: generateUuid(), code: 'khaima', name_fr: 'Tente Khaïma Royale', name_ar: 'خيمة صحراوية ملكية تقليدية', name_en: 'Royal Khaima Luxury Tent' },
      { id: generateUuid(), code: 'villa', name_fr: 'Villa Royale des Mille Coupoles', name_ar: 'فيلا ملكية بألف قبة', name_en: 'Royal Villa of Thousand Domes' },
    ];

    for (const rt of roomTypes) {
      await tx.query(`
        INSERT INTO room_types (id, code, name_fr, name_ar, name_en)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (code) DO NOTHING;
      `, [rt.id, rt.code, rt.name_fr, rt.name_ar, rt.name_en]);
    }

    // Retrieve type IDs
    const rtRows = await tx.query<{ id: string; code: string }>('SELECT id, code FROM room_types');
    const typeMap = new Map(rtRows.rows.map((r) => [r.code, r.id]));

    // Retrieve amenity IDs from database
    const amenityDbRows = await tx.query<{ id: string }>('SELECT id FROM amenities');
    const dbAmenityIds = amenityDbRows.rows.map((r) => r.id);

    // 4. Seed Accommodations / Rooms
    const rooms = [
      {
        id: generateUuid(),
        slug: 'chambre-deluxe-double',
        type_code: 'hotel_room',
        name_fr: 'Chambre Deluxe avec Balcon Oasis',
        name_ar: 'غرفة ديلوكس مزدوجة مع شرفة على الواحة',
        name_en: 'Deluxe Room with Oasis Balcony',
        description_fr: 'Élégante chambre de 45 m² alliant raffinement contemporain et touches artisanales du Souf. Grand lit King-size, salle de bains en marbre avec baignoire et douche à l\'italienne, et balcon privé donnant sur la palmeraie verdoyante.',
        description_ar: 'غرفة راقية بمساحة 45 متراً مربعاً تجمع بين الفخامة المعاصرة واللمسات التراثية لوادي سوف. سرير ملكي كينغ، حمام رخامي فاخر مع حوض استحمام ودش إيطالي، وشرفة خاصة تطل على بساتين النخيل.',
        description_en: 'Elegant 45 sqm room combining contemporary refinement with Souf craftsmanship. King-size bed, marble bathroom with tub and walk-in shower, and private balcony overlooking the lush palm grove.',
        surface_sqm: 45,
        max_adults: 2,
        max_children: 1,
        bed_config: '1 Lit King-Size (180x200)',
        base_price_dzd: 24000,
        total_units: 15,
        images: [
          'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: generateUuid(),
        slug: 'chambre-deluxe-twin',
        type_code: 'hotel_room',
        name_fr: 'Chambre Deluxe Lits Jumeaux Vue Palmeraie',
        name_ar: 'غرفة ديلوكس بسريرين منفصلين وإطلالة على النخيل',
        name_en: 'Deluxe Twin Room Palm View',
        description_fr: 'Spacieuse chambre double de 45 m² avec deux lits jumeaux grand confort, espace bureau, dressing et balcon ouvrant sur le calme apaisant des jardins du complexe.',
        description_ar: 'غرفة فسيحة بمساحة 45 متراً مربعاً بسريرين منفصلين عاليي الراحة، مساحة عمل، خزانة ملابس وشرفة تطل على الهدوء الساحر لحدائق المنتجع.',
        description_en: 'Spacious 45 sqm double room with two premium twin beds, dedicated workspace, dressing area, and balcony opening onto the peaceful tranquility of resort gardens.',
        surface_sqm: 45,
        max_adults: 2,
        max_children: 1,
        bed_config: '2 Lits Jumeaux Confort (120x200)',
        base_price_dzd: 24000,
        total_units: 12,
        images: [
          'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: generateUuid(),
        slug: 'bungalow-saharien-prestige',
        type_code: 'bungalow',
        name_fr: 'Bungalow Saharien d\'Exception avec Coupole',
        name_ar: 'بنغالو صحراوي استثنائي بقبة معمارية تقليدية',
        name_en: 'Prestige Saharan Bungalow with Dome Architecture',
        description_fr: 'Bungalow individuel de 75 m² couronné par les coupoles emblématiques d\'El Oued. Comprend un salon privé, chambre nuptiale, terrasse spacieuse et jardin privatif entouré de palmiers dattiers.',
        description_ar: 'بنغالو مستقل بمساحة 75 متراً مربعاً تعلوه القباب الهندسية الشهيرة لمدينة الألف قبة. يضم صالوناً خاصاً، غرفة نوم رئيسية فاخرة، شرفة فسيحة وحديقة خاصة محاطة بأشجار النخيل.',
        description_en: 'Standalone 75 sqm bungalow crowned by the iconic dome architecture of El Oued. Features an authentic living salon, master bedroom, spacious terrace, and secluded private garden nestled among date palms.',
        surface_sqm: 75,
        max_adults: 3,
        max_children: 2,
        bed_config: '1 Lit King-Size + Canapé-lit de salon',
        base_price_dzd: 42000,
        total_units: 8,
        images: [
          'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: generateUuid(),
        slug: 'tente-khaima-royale',
        type_code: 'khaima',
        name_fr: 'Tente Khaïma Royale Bédouine de Luxe',
        name_ar: 'خيمة خيمة ملكية بدوية فاخرة مجهزة بالكامل',
        name_en: 'Royal Bedouin Luxury Khaima Tent',
        description_fr: 'Une immersion absolue dans le luxe nomade du Sahara. Khaïma traditionnelle de 60 m² entièrement climatisée, ornée de tapis berbères faits main, lanternes artisanales en cuivre et salle de bain privative intégrée.',
        description_ar: 'تجربة فريدة من نوعها في قلب الصحراء مع كل وسائل الرفاهية العصرية. خيمة بدوية بمساحة 60 متراً مربعاً مكيفة بالكامل، مفروشة بزرابي تقليدية وفوانيس نحاسية مع حمام خاص متكامل.',
        description_en: 'An authentic immersion into Saharan nomadic luxury. Fully air-conditioned 60 sqm traditional khaima adorned with handmade Berber carpets, artisanal copper lanterns, and en-suite private bathroom.',
        surface_sqm: 60,
        max_adults: 2,
        max_children: 1,
        bed_config: '1 Lit King-Size Bédouin Prestige',
        base_price_dzd: 38000,
        total_units: 6,
        images: [
          'https://images.unsplash.com/photo-1510312305653-8ed496efae75?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1540541338287-41700207dee6?auto=format&fit=crop&w=1200&q=80'
        ]
      },
      {
        id: generateUuid(),
        slug: 'villa-royale-des-mille-coupoles',
        type_code: 'villa',
        name_fr: 'Villa Royale des Mille Coupoles avec Piscine Privative',
        name_ar: 'الفيلا الملكية ذات الألف قبة مع مسبح خاص',
        name_en: 'Royal Villa of a Thousand Domes with Plunge Pool',
        description_fr: 'Le summum du luxe saharien. Villa magistrale de 160 m² dotée de deux suites parentales, majlis traditionnel, cuisine de service, patio ombragé et bassin privé rafraîchissant.',
        description_ar: 'قمة الفخامة الصحراوية. فيلا مهيبة بمساحة 160 متراً مربعاً تحتوي على جناحين رئيسيين، مجلس عربي تقليدي، فناء ظليل ومسبح خاص منعش.',
        description_en: 'The pinnacle of Saharan luxury. Masterful 160 sqm villa featuring two master suites, authentic Arabian majlis, shaded courtyard patio, and refreshing private plunge pool.',
        surface_sqm: 160,
        max_adults: 4,
        max_children: 3,
        bed_config: '2 Lits King-Size + Grand Majlis',
        base_price_dzd: 88000,
        total_units: 1,
        images: [
          'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
          'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80'
        ]
      }
    ];

    for (const r of rooms) {
      const typeId = typeMap.get(r.type_code);
      if (!typeId) continue;

      const roomInsertRes = await tx.query<{ id: string }>(`
        INSERT INTO rooms (
          id, slug, type_id, name_fr, name_ar, name_en, 
          description_fr, description_ar, description_en,
          surface_sqm, max_adults, max_children, bed_config, 
          base_price_dzd, total_units, is_active
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, true)
        ON CONFLICT (slug) DO UPDATE SET
          name_fr = EXCLUDED.name_fr,
          name_ar = EXCLUDED.name_ar,
          name_en = EXCLUDED.name_en,
          base_price_dzd = EXCLUDED.base_price_dzd,
          total_units = EXCLUDED.total_units
        RETURNING id;
      `, [
        r.id, r.slug, typeId, r.name_fr, r.name_ar, r.name_en,
        r.description_fr, r.description_ar, r.description_en,
        r.surface_sqm, r.max_adults, r.max_children, r.bed_config,
        r.base_price_dzd, r.total_units
      ]);

      const actualRoomId = roomInsertRes.rows[0].id;

      // Link images
      for (let i = 0; i < r.images.length; i++) {
        await tx.query(`
          INSERT INTO room_images (id, room_id, url, alt_text, display_order, is_primary)
          VALUES ($1, $2, $3, $4, $5, $6)
          ON CONFLICT (id) DO NOTHING;
        `, [generateUuid(), actualRoomId, r.images[i], r.name_fr, i, i === 0]);
      }

      // Link amenities
      for (const amenId of dbAmenityIds) {
        await tx.query(`
          INSERT INTO room_amenities (room_id, amenity_id)
          VALUES ($1, $2)
          ON CONFLICT DO NOTHING;
        `, [actualRoomId, amenId]);
      }
    }

    // 5. Seed Services
    const services = [
      {
        id: generateUuid(),
        code: 'breakfast_buffet',
        category: 'dining',
        name_fr: 'Petit-déjeuner Buffet Gastronomique au Mirage',
        name_ar: 'بوفيه إفطار صباحي فاخر بمطعم الميراج',
        name_en: 'Gourmet Buffet Breakfast at Le Mirage',
        description_fr: 'Assortiment de viennoiseries fraîches, dattes Deglet Nour de la palmeraie d\'El Oued, fromages fins, jus pressés et galettes traditionnelles.',
        description_ar: 'تشكيلة من المخبوزات الطازجة، تمور دقلة نور الأصلية من واحة الوادي، أجبان فاخرة وعصائر طازجة وخبز تقليدي.',
        description_en: 'Fresh pastries, organic local Deglet Nour dates from El Oued oasis, artisanal cheeses, fresh juices, and traditional Saharan breads.',
        price_dzd: 2800,
        duration_minutes: 60,
      },
      {
        id: generateUuid(),
        code: 'airport_shuttle_vip',
        category: 'transport',
        name_fr: 'Transfert Privé Aéroport Guemar (ELU) Aller-Retour',
        name_ar: 'نقل خاص VIP من وإلى مطار قمار بالوادي',
        name_en: 'Private VIP Roundtrip Airport Shuttle (Guemar ELU)',
        description_fr: 'Prise en charge personnalisée dès votre atterrissage en véhicule premium climatisé avec chauffeur privé.',
        description_ar: 'استقبال شخصي فور وصول الطائرة في سيارة فاخرة مكيفة مع سائق خاص وصولاً إلى بهو المنتجع.',
        description_en: 'Personalized meet-and-greet at Guemar airport terminal in a luxury climate-controlled vehicle.',
        price_dzd: 4500,
        duration_minutes: 45,
      },
      {
        id: generateUuid(),
        code: 'hammam_rituel_royal',
        category: 'spa',
        name_fr: 'Rituel Hammam Royal & Gommage Soufi au Savon Noir',
        name_ar: 'طقوس الحمام الملكي والتقشير السوفي بالصابون الأسود',
        name_en: 'Royal Hammam Ritual & Soufi Black Soap Scrub',
        description_fr: 'Bain de vapeur thermal dans notre spa de 2500m², gommage au gant kessa, enveloppement à l\'argile du désert et massage relaxant.',
        description_ar: 'حمام بخار حراري في السبا البالغ مساحته 2500 متر مربع، تقشير بالكيسة، تغليف بالطين الصحراوي وتدليك للاسترخاء التام.',
        description_en: 'Thermal steam bath in our 2500 sqm spa, deep kessa exfoliation, desert clay wrap, and soothing relaxation massage.',
        price_dzd: 8500,
        duration_minutes: 90,
      },
      {
        id: generateUuid(),
        code: 'massage_saharien_aromatic',
        category: 'spa',
        name_fr: 'Massage Saharien Signature aux Huiles Précieuses de Dattes',
        name_ar: 'تدليك صحراوي مميز بزيوت التمر العطرية النفيسة',
        name_en: 'Signature Saharan Massage with Precious Date Kernel Oils',
        description_fr: 'Soin holistique décontractant prodigué par nos thérapeutes experts pour dissiper toute fatigue de voyage.',
        description_ar: 'علاج مهدئ ومجدد للحيوية بأيدي أخصائيين لتخفيف التوتر واستعادة الراحة الجسدية والنفسية.',
        description_en: 'Holistic deep-tissue therapy using local botanical essences to dissolve travel fatigue.',
        price_dzd: 12000,
        duration_minutes: 60,
      },
      {
        id: generateUuid(),
        code: 'diner_bivouac_etoiles',
        category: 'dining',
        name_fr: 'Dîner Bivouac sous la Voûte Céleste Saharienne',
        name_ar: 'عشاء فاخر في مخيم صحراوي تحت سماء الصحراء المرصعة بالنجوم',
        name_en: 'Private Desert Bivouac Dinner under Saharan Starlight',
        description_fr: 'Soirée féerique au creux des dunes dorées avec feu de camp, musique bédouine acoustique et couscous royal aux sept légumes.',
        description_ar: 'أمسية ساحرة بين الرمال الذهبية مع موقد نار دافئ، موسيقى بدوية أصيلة وأشهى أطباق الكسكسي الملكي.',
        description_en: 'Enchanting evening nestled in golden sand dunes with crackling campfire, live oud music, and royal Saharan banquet.',
        price_dzd: 9500,
        duration_minutes: 180,
      },
      {
        id: generateUuid(),
        code: 'safari_4x4_dunes',
        category: 'activity',
        name_fr: 'Safari 4x4 Exclusif dans les Grandes Dunes du Grand Erg',
        name_ar: 'سفاري حصري بسيارات الدفع الرباعي في كثبان العرق الشرقي الكبير',
        name_en: 'Exclusive 4x4 Safari in the Dunes of Grand Erg Oriental',
        description_fr: 'Traversée sensationnelle des plus hautes dunes d\'El Oued avec nos pilotes guides sahariens chevronnés.',
        description_ar: 'جولة مشوقة عبر أعلى الكثبان الرملية في وادي سوف برفقة أدلاء وسائقين صحراويين محترفين.',
        description_en: 'Thrilling desert expedition across dramatic dunes guided by expert native Saharan off-road drivers.',
        price_dzd: 14000,
        duration_minutes: 150,
      },
      {
        id: generateUuid(),
        code: 'meharee_dromadaires_coucher',
        category: 'activity',
        name_fr: 'Balade à Dos de Dromadaire au Coucher du Soleil',
        name_ar: 'جولة على ظهور الجمال وقت الغروب الذهبي',
        name_en: 'Sunset Camel Caravan Trek across the Dunes',
        description_fr: 'Caravane paisible au rythme des pas dans le sable fin lors du coucher de soleil aux teintes pourpres.',
        description_ar: 'قافلة هادئة تتنقل بانسجام مع هدوء الصحراء الساحر أثناء مغيب الشمس بألوانه البهية.',
        description_en: 'Peaceful nomadic camel ride through silent dunes bathed in majestic sunset hues.',
        price_dzd: 6000,
        duration_minutes: 90,
      }
    ];

    for (const s of services) {
      await tx.query(`
        INSERT INTO services (id, code, category, name_fr, name_ar, name_en, description_fr, description_ar, description_en, price_dzd, duration_minutes, is_active)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true)
        ON CONFLICT (code) DO UPDATE SET
          name_fr = EXCLUDED.name_fr,
          name_ar = EXCLUDED.name_ar,
          name_en = EXCLUDED.name_en,
          price_dzd = EXCLUDED.price_dzd;
      `, [s.id, s.code, s.category, s.name_fr, s.name_ar, s.name_en, s.description_fr, s.description_ar, s.description_en, s.price_dzd, s.duration_minutes]);
    }

    // 6. Seed an Initial Demo Reservation to test calendar and admin view (only if not already created)
    const existingRes = await tx.query<{ id: string }>('SELECT id FROM reservations WHERE booking_number = $1', ['LGD-2026-000101']);
    if (existingRes.rows.length === 0) {
      const roomRow = await tx.query<{ id: string }>('SELECT id FROM rooms WHERE slug = $1', ['chambre-deluxe-double']);
      if (roomRow.rows.length > 0) {
        const demoGuestId = generateUuid();
        await tx.query(`
          INSERT INTO guests (id, first_name, last_name, email, phone, country)
          VALUES ($1, 'Nadjim', 'Yahiaoui', 'nadjim.guest@example.com', '+213 550 12 34 56', 'Algérie')
          ON CONFLICT (id) DO NOTHING;
        `, [demoGuestId]);

        const demoBookingId = generateUuid();
        const today = new Date();
        const checkIn = new Date(today);
        checkIn.setDate(today.getDate() + 3);
        const checkOut = new Date(today);
        checkOut.setDate(today.getDate() + 6);

        const checkInStr = checkIn.toISOString().split('T')[0];
        const checkOutStr = checkOut.toISOString().split('T')[0];

        await tx.query(`
          INSERT INTO reservations (
            id, booking_number, room_id, guest_id, check_in, check_out, 
            adults, children, status, special_requests, arrival_time, 
            room_total_dzd, services_total_dzd, taxes_dzd, grand_total_dzd
          )
          VALUES ($1, 'LGD-2026-000101', $2, $3, $4, $5, 2, 0, 'confirmed', 'Arrivée tardive vers 18h, étage élevé souhaité.', '18:00', 72000, 4500, 6885, 83385);
        `, [demoBookingId, roomRow.rows[0].id, demoGuestId, checkInStr, checkOutStr]);

        await tx.query(`
          INSERT INTO payments (id, reservation_id, amount_dzd, method, status, transaction_ref, is_simulator)
          VALUES ($1, $2, 83385, 'arrival', 'completed', 'REF-ARR-101', true);
        `, [generateUuid(), demoBookingId]);

        await tx.query(`
          INSERT INTO audit_logs (id, actor_email, action, entity, entity_id, details)
          VALUES ($1, 'system@hotel-lagazelledor.dz', 'SEED_RESERVATION_CREATED', 'reservation', $2, 'Initial demonstration reservation created for testing calendar and PMS');
        `, [generateUuid(), demoBookingId]);
      }
    }
  });

  console.log('✅ PostgreSQL database seeded successfully with authentic resort data!');
}

if (process.argv[1]?.endsWith('seed.ts')) {
  runSeed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Seeding failed:', err);
      process.exit(1);
    });
}
