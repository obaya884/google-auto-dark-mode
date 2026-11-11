/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom', // jsdom is better for frontend logic testing (even if pure logic, in case we touch DOM later)
};
