// 验证 STS1 种子编码
// 字符集来自 SeedHelper.java 反编译: "0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ" (35字符，无O)
const CHARS = '0123456789ABCDEFGHIJKLMNPQRSTUVWXYZ';
const BASE = BigInt(CHARS.length); // 35

function getString(seedLong) {
    // Java Long.toUnsignedString: 把有符号 long 当无符号处理
    let n = BigInt.asUintN(64, BigInt(seedLong));
    if (n === 0n) return '0';
    let result = '';
    while (n > 0n) {
        let remainder = n % BASE;
        result = CHARS[Number(remainder)] + result;
        n = n / BASE;
    }
    return result;
}

function getLong(seedStr) {
    let s = seedStr.toUpperCase().replace(/O/g, '0');
    let result = 0n;
    for (let i = 0; i < s.length; i++) {
        let idx = CHARS.indexOf(s[i]);
        if (idx === -1) continue;
        result = result * BASE + BigInt(idx);
    }
    return result.toString();
}

// 测试已知种子
const tests = [
    '6234571092472389959',
    '331631984622861617',
    '4305910011538712845',
    '6185565274879471148',
    '-5515238101531734451',
    '-8162589513263571422',
    '-7982999556819272215',
    '-4868207344588033244',
    '-6310039228196699469',
    '-9223372036854775808',
    '2139475761390174873',
    '2808533444925374133',
    '1433356400407781709',
];

console.log('=== STS1 Seed Encoding Verification ===');
console.log('Character set: ' + CHARS);
console.log('Base: ' + CHARS.length);
console.log('');

tests.forEach(t => {
    const s = getString(t);
    const back = getLong(s);
    const ok = t === back ? 'OK' : 'MISMATCH';
    console.log(t + ' => ' + s + ' => ' + back + '  [' + ok + ']');
});

// SEED_DEFAULT_LENGTH = getString(Long.MIN_VALUE).length()
const minVal = getString('-9223372036854775808');
console.log('\nLong.MIN_VALUE => ' + minVal + ' (length: ' + minVal.length + ')');
console.log('SEED_DEFAULT_LENGTH = ' + minVal.length);
