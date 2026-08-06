/**
 * Crypto — primitivas criptográficas para el sistema.
 *
 * Hash: SHA-256(salt + ":" + password) — nunca almacenar contraseñas en texto plano.
 * Salt: UUID sin guiones (128 bits de entropía).
 */
var Crypto = {
  /**
   * Genera un hash SHA-256 del formato "salt:password".
   * @param {string} password
   * @param {string} salt
   * @returns {string} hex string de 64 caracteres
   */
  hash: function (password, salt) {
    var raw = Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      salt + ":" + password,
      Utilities.Charset.UTF_8
    );
    return raw.map(function (b) {
      return (b < 0 ? b + 256 : b).toString(16).padStart(2, "0");
    }).join("");
  },

  /** UUID sin guiones — usado como salt de contraseña. */
  salt: function () {
    return Utilities.getUuid().replace(/-/g, "");
  },

  /** UUID estándar — usado como ID de entidad. */
  uuid: function () {
    return Utilities.getUuid();
  },

  /** ID de request con prefijo legible. */
  requestId: function () {
    return "REQ-" + Utilities.getUuid().replace(/-/g, "").substring(0, 8).toUpperCase();
  },

  /** Token de 64 caracteres para reset de contraseña. */
  resetToken: function () {
    return Utilities.getUuid().replace(/-/g, "") + Utilities.getUuid().replace(/-/g, "");
  },

  /** Verifica si password + salt produce el hash esperado. */
  verify: function (password, salt, expectedHash) {
    return Crypto.hash(password, salt) === expectedHash;
  },
};
