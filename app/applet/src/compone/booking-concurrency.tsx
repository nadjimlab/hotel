import crypto from 'crypto';

const BASE_URL = process.env.API_URL || 'http://localhost:3000/api';
const generateUuid = () => crypto.randomUUID();

let passedTests = 0;
let totalTests = 0;

function assert(condition: boolean, testName: string, details?: string) {
  totalTests++;
  if (condition) {
    console.log(`  ✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`  ❌ [FAIL] ${testName} ${details ? `(${details})` : ''}`);
  }
}

async function runAllTests() {
  console.log('🧪 Starting La Gazelle d\'Or PostgreSQL & Concurrency Test Suite...\n');

  // Verify server is reachable
  const healthRes = await fetch(`${BASE_URL}/health`);
  if (!healthRes.ok) {
    throw new Error(`Server is not responding at ${BASE_URL}/health`);
  }
  const healthData = await healthRes.json();
  console.log(`📡 Connected to Live API: ${healthData.resort} (${healthData.database.engine})\n`);

  // Retrieve room catalogue
  const roomsRes = await fetch(`${BASE_URL}/rooms`);
  const roomsData = await roomsRes.json();
  const testRoom = roomsData.rooms[0];
  const testRoomId = testRoom.id;

  // -------------------------------------------------------------
  // Test 1: Successful Booking Flow & Transaction Integrity
  // -------------------------------------------------------------
  console.log('🔹 Running Test 1: Successful Booking Creation');
  let confirmedBookingNumber = '';
  try {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
        adults: 2,
        children: 0,
        guest: {
          firstName: 'Amina',
          lastName: 'Mansouri',
          email: 'amina.mansouri@test.dz',
          phone: '+213 555 12 34 56',
          country: 'Algérie',
        },
        paymentMethod: 'arrival',
        specialRequests: 'Chambre avec vue sur les palmiers',
      }),
    });

    const booking = await res.json();
    assert(booking.bookingNumber && booking.bookingNumber.startsWith('LGD-'), 'Booking number format starts with LGD-');
    assert(booking.nights === 3, 'Calculates exactly 3 nights');
    assert(booking.status === 'confirmed', 'Booking status is confirmed');
    assert(booking.payment.status === 'pending', 'Payment status is pending for Pay on Arrival');
    confirmedBookingNumber = booking.bookingNumber;
  } catch (err: any) {
    assert(false, 'Successful booking creation', err.message);
  }

  // -------------------------------------------------------------
  // Test 2: Invalid Date Format Handling
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 2: Invalid Date Rejection');
  try {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: 'invalid-date',
        checkOut: '2026-12-04',
        adults: 2,
        guest: { firstName: 'Test', lastName: 'User', email: 'test@invalid.dz' },
        paymentMethod: 'arrival',
      }),
    });
    assert(res.status === 400, 'Correctly rejected invalid date format with 400');
  } catch (err: any) {
    assert(false, 'Invalid date rejection', err.message);
  }

  // -------------------------------------------------------------
  // Test 3: Check-out Before or Equal to Check-in
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 3: Check-out Before Check-in');
  try {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: '2026-12-10',
        checkOut: '2026-12-05',
        adults: 2,
        guest: { firstName: 'Test', lastName: 'User', email: 'test@invalid.dz' },
        paymentMethod: 'arrival',
      }),
    });
    assert(res.status === 400, 'Correctly rejected check-out before check-in with 400');
  } catch (err: any) {
    assert(false, 'Check-out before check-in check', err.message);
  }

  // -------------------------------------------------------------
  // Test 4: Adult Capacity Limit
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 4: Adult Capacity Check');
  try {
    const res = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: '2026-12-01',
        checkOut: '2026-12-04',
        adults: 99, // exceeds max adults
        guest: { firstName: 'Test', lastName: 'User', email: 'test@capacity.dz' },
        paymentMethod: 'arrival',
      }),
    });
    assert(res.status === 400, 'Correctly rejected reservation exceeding max room capacity');
  } catch (err: any) {
    assert(false, 'Capacity check', err.message);
  }

  // -------------------------------------------------------------
  // Test 5 & 6: Concurrent Race Condition & Double-Booking Protection
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 5 & 6: Concurrent Booking Race Condition & PostgreSQL Lock');
  // Use the 1-unit villa from the API
  const singleUnitRoom = roomsData.rooms.find((r: any) => r.slug === 'villa-royale-des-mille-coupoles' || r.total_units === 1) || testRoom;

  const randomYear = 2030 + Math.floor(Math.random() * 50);
  const randomMonth = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
  const targetCheckIn = `${randomYear}-${randomMonth}-10`;
  const targetCheckOut = `${randomYear}-${randomMonth}-15`;

  const req1 = fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: singleUnitRoom.id,
      checkIn: targetCheckIn,
      checkOut: targetCheckOut,
      adults: 2,
      guest: { firstName: 'Guest A', lastName: 'Simultaneous', email: 'guest.a@test.dz', phone: '+213 555 11 11 11', country: 'Algérie' },
      paymentMethod: 'arrival',
    }),
  });

  const req2 = fetch(`${BASE_URL}/reservations`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roomId: singleUnitRoom.id,
      checkIn: targetCheckIn,
      checkOut: targetCheckOut,
      adults: 2,
      guest: { firstName: 'Guest B', lastName: 'Simultaneous', email: 'guest.b@test.dz', phone: '+213 555 22 22 22', country: 'Algérie' },
      paymentMethod: 'arrival',
    }),
  });

  const [res1, res2] = await Promise.all([req1, req2]);
  const statuses = [res1.status, res2.status].sort();

  assert(statuses[0] === 201 && statuses[1] === 409, 'Exactly one concurrent booking succeeds (201) and one is rejected (409)');

  // -------------------------------------------------------------
  // Test 7: Direct Double Booking Collision Check
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 7: Direct Overlapping Reservation Collision Check');
  try {
    const conflictRes = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: singleUnitRoom.id,
        checkIn: `2028-${uniqueMonth}-11`, // inside 2028-XX-10 -> 2028-XX-15
        checkOut: `2028-${uniqueMonth}-14`,
        adults: 2,
        guest: { firstName: 'Guest C', lastName: 'Collision', email: 'guest.c@test.dz', phone: '+213 555 33 33 33', country: 'Algérie' },
        paymentMethod: 'arrival',
      }),
    });
    assert(conflictRes.status === 409, 'PostgreSQL collision check prevents overlapping reservation with 409');
  } catch (err: any) {
    assert(false, 'Double booking check', err.message);
  }

  // -------------------------------------------------------------
  // Test 8: Cancellation & Inventory Release
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 8: Cancellation & Inventory Release');
  try {
    const cancelRes = await fetch(`${BASE_URL}/reservations/${confirmedBookingNumber}/cancel`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'amina.mansouri@test.dz',
        reason: 'Changement de dates',
      }),
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Cancellation request succeeds');
    assert(cancelData.status === 'cancelled', 'Reservation status updated to cancelled');

    // Verify lookup confirms cancelled status
    const lookupRes = await fetch(`${BASE_URL}/reservations/lookup?bookingNumber=${confirmedBookingNumber}&email=amina.mansouri@test.dz`);
    const lookupData = await lookupRes.json();
    assert(lookupData.reservation.status === 'cancelled', 'Lookup reflects cancelled status in database');
  } catch (err: any) {
    assert(false, 'Cancellation flow', err.message);
  }

  // -------------------------------------------------------------
  // Test 9: Server-Authoritative Price Calculation (Anti-Tampering)
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 9: Anti-Price Tampering Verification');
  try {
    const tamperRes = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: '2026-11-20',
        checkOut: '2026-11-23',
        adults: 2,
        roomTotalDzd: 1, // Tampered client price!
        grandTotalDzd: 1, // Tampered grand total!
        guest: { firstName: 'Hacker', lastName: 'PriceTamper', email: 'tamper@test.dz', phone: '+213 555 99 99 99' },
        paymentMethod: 'arrival',
      }),
    });
    const tamperData = await tamperRes.json();
    assert(tamperData.roomTotalDzd > 1000, 'Server ignored client tampered price and calculated authoritative rate from DB');
    assert(tamperData.grandTotalDzd === tamperData.roomTotalDzd + tamperData.servicesTotalDzd + tamperData.taxesDzd, 'Math strictly verified on server');
  } catch (err: any) {
    assert(false, 'Anti-tampering test', err.message);
  }

  // -------------------------------------------------------------
  // Test 10: Unauthorized Admin Access Rejection
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 10: Unauthorized Admin Access Rejection');
  try {
    const unauthRes = await fetch(`${BASE_URL}/admin/dashboard`);
    assert(unauthRes.status === 401, 'Unauthorized request to /api/admin/dashboard rejected with 401');

    const fakeTokenRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: 'Bearer fake.invalid.jwt.token' },
    });
    assert(fakeTokenRes.status === 401, 'Request with forged token rejected with 401');
  } catch (err: any) {
    assert(false, 'Unauthorized admin access test', err.message);
  }

  // -------------------------------------------------------------
  // Test 11: Authorized Admin Login & Dashboard Data
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 11: Authorized Admin Authentication & Data Retrieval');
  try {
    const loginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'admin@hotel-lagazelledor.dz',
        password: 'Gazelle2026!',
      }),
    });
    assert(loginRes.status === 200, 'Admin login succeeds with valid credentials');
    const loginData = await loginRes.json();
    assert(loginData.token && loginData.user.role === 'admin', 'Login returns valid admin JWT and role');

    const adminDashboardRes = await fetch(`${BASE_URL}/admin/dashboard`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    });
    assert(adminDashboardRes.status === 200, 'Authenticated admin can access PMS dashboard');
    const adminData = await adminDashboardRes.json();
    assert(typeof adminData.occupancyRate === 'number', 'Admin dashboard returns numeric occupancy rate');
    assert(typeof adminData.totalRevenueDzd === 'number', 'Admin dashboard returns numeric total revenue');
  } catch (err: any) {
    assert(false, 'Authorized admin flow', err.message);
  }

  // -------------------------------------------------------------
  // Test 12: Payment Simulator Flag Safety
  // -------------------------------------------------------------
  console.log('\n🔹 Running Test 12: Payment Provider Simulator Flag Verification');
  try {
    const simRes = await fetch(`${BASE_URL}/reservations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        roomId: testRoomId,
        checkIn: '2026-11-25',
        checkOut: '2026-11-27',
        adults: 2,
        guest: { firstName: 'Karim', lastName: 'Brahimi', email: 'karim.brahimi@test.dz', phone: '+213 555 88 88 88' },
        paymentMethod: 'cib',
      }),
    });
    const simData = await simRes.json();
    assert(simData.payment.isSimulator === true, 'CIB/Edahabia provider clearly flagged as isSimulator: true');
    assert(simData.payment.status === 'completed', 'Simulator payment marked as completed for sandbox test');
  } catch (err: any) {
    assert(false, 'Simulator flag check', err.message);
  }

  // -------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------
  console.log('\n======================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests}/${totalTests} Passed (${Math.round((passedTests / totalTests) * 100)}%)`);
  console.log('======================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL 12 POSTGRESQL & BOOKING CONCURRENCY TESTS PASSED!');
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runAllTests().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
