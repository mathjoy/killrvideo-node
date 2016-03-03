import { createHash, validatePassword } from '../../src/common/password-hash';

describe('password-hash', function() {
  describe('createHash', function() {
    const tests = [
      { password: 'somepassword', rejected: false },
      { password: '', rejected: false },
      { password: null, rejected: true }
    ];
    
    tests.forEach(function(test) {
      it(`should eventually${test.rejected ? '' : ' not'} reject the password [${test.password}]`, function() {
        const hash = createHash(test.password);
        if (test.rejected) {
          return hash.should.be.rejected;
        } else {
          return hash.should.eventually.be.a('string').and.not.empty;
        }
      });
    });
  });
  
  describe('validatePassword', function() {
    it('should eventually return true for valid passwords', function() {
      return createHash('somePassword')
        .then(hash => validatePassword('somePassword', hash))
        .should.eventually.be.true;
    });
    
    it('should eventually return false for invalid passwords', function() {
      return createHash('somePassword')
        .then(hash => validatePassword('notTheSamePassword', hash))
        .should.eventually.be.false;
    });
  });
});