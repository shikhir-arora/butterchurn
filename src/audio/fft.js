export default class SDFT {
  constructor(samplesIn, samplesOut, equalize = false) {
    this.samplesIn = samplesIn;
    this.samplesOut = samplesOut;
    this.equalize = equalize;

    if (this.equalize) {
      this.initEqualizeTable();
    }

    this.real = new Float32Array(this.samplesOut);
    this.imag = new Float32Array(this.samplesOut);
    this.initCosSinTable();
  }

  initEqualizeTable() {
    this.equalizeArr = new Float32Array(this.samplesOut);
    const invHalfNFREQ = 1.0 / this.samplesOut;
    for (let i = 0; i < this.samplesOut; i++) {
      this.equalizeArr[i] =
        -0.02 * Math.log((this.samplesOut - i) * invHalfNFREQ);
    }
  }

  initCosSinTable() {
    this.cosTable = new Float32Array(this.samplesOut);
    this.sinTable = new Float32Array(this.samplesOut);
    const theta = (-2.0 * Math.PI) / this.samplesOut;
    for (let i = 0; i < this.samplesOut; i++) {
      this.cosTable[i] = Math.cos(i * theta);
      this.sinTable[i] = Math.sin(i * theta);
    }
  }

  timeToFrequencyDomainSDFT(newSample, oldSample) {
    for (let i = 0; i < this.samplesOut; i++) {
      this.real[i] += newSample - oldSample;
      this.imag[i] +=
        newSample * this.sinTable[i] - oldSample * this.sinTable[i];
      this.real[i] =
        this.real[i] * this.cosTable[i] - this.imag[i] * this.sinTable[i];
      this.imag[i] =
        this.imag[i] * this.cosTable[i] + this.real[i] * this.sinTable[i];
    }

    const spectralDataOut = new Float32Array(this.samplesOut);
    if (this.equalize) {
      for (let i = 0; i < this.samplesOut; i++) {
        spectralDataOut[i] =
          this.equalizeArr[i] *
          Math.sqrt(this.real[i] * this.real[i] + this.imag[i] * this.imag[i]);
      }
    } else {
      for (let i = 0; i < this.samplesOut; i++) {
        spectralDataOut[i] = Math.sqrt(
          this.real[i] * this.real[i] + this.imag[i] * this.imag[i],
        );
      }
    }

    return spectralDataOut;
  }
}
