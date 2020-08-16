const email = /^([a-zA-Z0-9._%-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})*$/;
const userName = /^[a-z0-9_-]{3,16}$/;
// Should have 1 lowercase letter, 1 uppercase letter, 1 number, and be at least 8 characters long
const password = /(?=(.*[0-9]))((?=.*[A-Za-z0-9])(?=.*[A-Z])(?=.*[a-z]))^.{8,}$/;

module.exports = {
  email,
  userName,
  password
}