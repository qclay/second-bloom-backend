const io = require('socket.io-client');

const SERVER_URL = process.env.SERVER_URL || 'http://localhost:3000';
const JWT_TOKEN = process.env.JWT_TOKEN || 'your-jwt-token-here';

console.log('🧪 WebSocket Testing Tool\n');
console.log(`Server: ${SERVER_URL}`);
console.log(`Token: ${JWT_TOKEN.substring(0, 20)}...\n`);

let testsPassed = 0;
let testsFailed = 0;

function test(name, testFn) {
  return new Promise((resolve) => {
    console.log(`\n📋 Test: ${name}`);
    try {
      testFn()
        .then(() => {
          console.log(`✅ PASSED: ${name}`);
          testsPassed++;
          resolve();
        })
        .catch((error) => {
          console.error(`❌ FAILED: ${name}`);
          console.error(`   Error: ${error.message}`);
          testsFailed++;
          resolve();
        });
    } catch (error) {
      console.error(`❌ FAILED: ${name}`);
      console.error(`   Error: ${error.message}`);
      testsFailed++;
      resolve();
    }
  });
}

async function testChatConnection() {
  return test('Chat WebSocket Connection', () => {
    return new Promise((resolve, reject) => {
      const socket = io(`${SERVER_URL}/chat`, {
        auth: { token: JWT_TOKEN },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.on('connect', () => {
        console.log('   ✓ Connected:', socket.id);
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });
    });
  });
}

async function testChatAuthentication() {
  return test('Chat Authentication', () => {
    return new Promise((resolve, reject) => {
      const socket = io(`${SERVER_URL}/chat`, {
        auth: { token: JWT_TOKEN },
        transports: ['websocket'],
        timeout: 10000,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Authentication timeout'));
      }, 10000);

      socket.on('connected', (data) => {
        console.log('   ✓ Authenticated as:', data.userId);
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });

      socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          clearTimeout(timeout);
          reject(new Error('Server disconnected - likely authentication failed'));
        }
      });
    });
  });
}

async function testChatKeepAlive() {
  return test('Chat Keepalive (Ping/Pong)', () => {
    return new Promise((resolve, reject) => {
      const socket = io(`${SERVER_URL}/chat`, {
        auth: { token: JWT_TOKEN },
        transports: ['websocket'],
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Keepalive timeout - no ping received'));
      }, 30000);

      socket.on('ping', () => {
        console.log('   ✓ Ping received');
        socket.emit('pong');
        console.log('   ✓ Pong sent');
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });
    });
  });
}

async function testAuctionConnection() {
  return test('Auction WebSocket Connection', () => {
    return new Promise((resolve, reject) => {
      const socket = io(`${SERVER_URL}/auction`, {
        auth: { token: JWT_TOKEN },
        transports: ['websocket', 'polling'],
        timeout: 10000,
      });

      const timeout = setTimeout(() => {
        socket.disconnect();
        reject(new Error('Connection timeout'));
      }, 10000);

      socket.on('connect', () => {
        console.log('   ✓ Connected:', socket.id);
        clearTimeout(timeout);
        socket.disconnect();
        resolve();
      });

      socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        socket.disconnect();
        reject(error);
      });
    });
  });
}

async function testHealthEndpoint() {
  return test('Health Check Endpoint', async () => {
    const fetch = (await import('node-fetch')).default;
    const response = await fetch(`${SERVER_URL}/api/v1/health/websocket`);
    const data = await response.json();
    
    console.log('   ✓ Health check response:', JSON.stringify(data, null, 2));
    
    if (data.status === 'ok') {
      return;
    } else {
      throw new Error('Health check returned non-ok status');
    }
  });
}

async function runAllTests() {
  console.log('🚀 Starting WebSocket tests...\n');

  await testHealthEndpoint();
  await testChatConnection();
  await testChatAuthentication();
  await testChatKeepAlive();
  await testAuctionConnection();

  console.log('\n' + '='.repeat(50));
  console.log('📊 Test Results:');
  console.log(`   ✅ Passed: ${testsPassed}`);
  console.log(`   ❌ Failed: ${testsFailed}`);
  console.log(`   📈 Success Rate: ${((testsPassed / (testsPassed + testsFailed)) * 100).toFixed(1)}%`);
  console.log('='.repeat(50));

  process.exit(testsFailed > 0 ? 1 : 0);
}

if (require.main === module) {
  runAllTests().catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, test };
