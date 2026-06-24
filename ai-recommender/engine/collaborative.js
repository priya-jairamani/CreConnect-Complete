'use strict';

/**
 * Collaborative Filtering via Stochastic Gradient Descent Matrix Factorization.
 *
 * Decomposes the brand×creator interaction matrix into two latent factor matrices:
 *   R ≈ U × V^T
 * where:
 *   U  = brands  matrix  [nBrands  × K]
 *   V  = creators matrix [nCreators × K]
 *   K  = number of latent factors
 *
 * Observed interactions are COMPLETED/ACCEPTED collaborations (positive signal = 1)
 * and REJECTED collaborations (negative signal = 0).
 */
class MatrixFactorization {
  /**
   * @param {object} opts
   * @param {number} opts.factors     - latent dimension (default 10)
   * @param {number} opts.epochs      - SGD iterations   (default 50)
   * @param {number} opts.lr          - learning rate    (default 0.01)
   * @param {number} opts.regularize  - L2 lambda        (default 0.02)
   */
  constructor({ factors = 10, epochs = 50, lr = 0.01, regularize = 0.02 } = {}) {
    this.K  = factors;
    this.epochs     = epochs;
    this.lr         = lr;
    this.regularize = regularize;

    this.U = null;         // brand latent matrix
    this.V = null;         // creator latent matrix
    this.brandIdx   = {};  // brandId   → row index in U
    this.creatorIdx = {};  // creatorId → row index in V
    this.trained = false;
  }

  /**
   * Trains the model from a list of collaboration records.
   * Each record must have { brandId, creatorId, status }.
   */
  train(collaborations) {
    // Build index maps
    const brandIds   = [...new Set(collaborations.map((c) => c.brandId))];
    const creatorIds = [...new Set(collaborations.map((c) => c.creatorId))];

    brandIds.forEach((id, i)   => { this.brandIdx[id]   = i; });
    creatorIds.forEach((id, i) => { this.creatorIdx[id] = i; });

    const nB = brandIds.length;
    const nC = creatorIds.length;

    // Initialize U and V with small random values
    this.U = this._randomMatrix(nB, this.K);
    this.V = this._randomMatrix(nC, this.K);

    // Build training set: (brandIdx, creatorIdx, rating)
    const trainSet = collaborations.map((c) => ({
      b: this.brandIdx[c.brandId],
      c: this.creatorIdx[c.creatorId],
      r: ['COMPLETED', 'ACCEPTED'].includes(c.status) ? 1.0 : 0.0,
    }));

    // SGD
    for (let epoch = 0; epoch < this.epochs; epoch++) {
      this._shuffle(trainSet);
      for (const { b, c, r } of trainSet) {
        const pred  = this._dot(this.U[b], this.V[c]);
        const error = r - pred;

        // Update U[b] and V[c]
        for (let k = 0; k < this.K; k++) {
          const uOld = this.U[b][k];
          const vOld = this.V[c][k];
          this.U[b][k] += this.lr * (2 * error * vOld - this.regularize * uOld);
          this.V[c][k] += this.lr * (2 * error * uOld - this.regularize * vOld);
        }
      }
    }

    this.trained = true;
  }

  /**
   * Predicts the latent compatibility score for a (brandId, creatorId) pair.
   * Returns 0–1 (clamped). Returns null if either id was not seen during training.
   */
  predict(brandId, creatorId) {
    if (!this.trained) return null;
    const b = this.brandIdx[brandId];
    const c = this.creatorIdx[creatorId];
    if (b === undefined || c === undefined) return null;

    const raw = this._dot(this.U[b], this.V[c]);
    return Math.min(1, Math.max(0, raw));
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  _randomMatrix(rows, cols) {
    return Array.from({ length: rows }, () =>
      Array.from({ length: cols }, () => (Math.random() - 0.5) * 0.1),
    );
  }

  _dot(a, b) {
    let s = 0;
    for (let i = 0; i < a.length; i++) s += a[i] * b[i];
    return s;
  }

  _shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
  }
}

module.exports = MatrixFactorization;
