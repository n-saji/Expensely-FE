import test from 'node:test';
import assert from 'node:assert/strict';
import { profileUrlFromPath } from '../utils/profileUrl.ts';
const target='https://expensely-profiles-993371733162.s3.us-east-2.amazonaws.com/';
test('old regional and global URLs move without changing the object path',()=>{
 for(const host of ['expensely-profiles.s3.amazonaws.com','expensely-profiles.s3.us-east-2.amazonaws.com']) assert.equal(profileUrlFromPath(`https://${host}/user/photo%20one.jpg`),target+'user/photo%20one.jpg');
});
test('relative keys move and external OAuth images remain unchanged',()=>{
 assert.equal(profileUrlFromPath('user/photo.jpg'),target+'user/photo.jpg');
 assert.equal(profileUrlFromPath('https://lh3.googleusercontent.com/photo'),'https://lh3.googleusercontent.com/photo');
 assert.equal(profileUrlFromPath('https://expensely-profiles.s3.amazonaws.com.evil.example/photo'),'https://expensely-profiles.s3.amazonaws.com.evil.example/photo');
 assert.equal(profileUrlFromPath(''),'');
});
