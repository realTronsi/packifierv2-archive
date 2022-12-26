"use strict";

/**
 * Object to array serializer
 * 
 * Copyright (c) 2022 tronsi
 *
 * Licensed under MIT license
 */

export default class Packifier {
  /**
   * @param {Object} schema
   */
  constructor (schema) {
    this.id = schema.id;
    this.req = schema.req;
    this.pre = schema.pre;
    this.reqlen = this.req.length;
    this.prelen = this.pre.length;
  
    this.segmentationThreshold = schema.segmentationThreshold;
    this.maxUnpackIterations = Math.ceil(this.prelen / this.segmentationThreshold);
  }
 
  /**
   * @param {Object} data
   * @param {Object} flags - dirty flags
   */
  pack (data, flags) {
    const req = this.req; // required
    const pre = this.pre; // precondition
    const reqlen = this.reqlen;
    const prelen = this.prelen;
    /* Optimization note: preallocated array was tested, there was no performance benefit */
    /* Best approach is over-allocating and bulk removing at the end, bulk removal negates the already minimal performance it provides */
    const packet = [this.id];
    
    let i = 0;
    // Push all required data
    do { packet.push(data[req[i]]); } while (++i < reqlen);
  
    if (prelen === 0) return pack;
    
    i = 0;
    const segmentationThreshold = this.segmentationThreshold;
    
    let bitflag = 0; // value of current bitflag
    let flagIndex = packet.length; // location of bitflag in packet
    let imod = 0; // value of i % segmentationThreshold
    packet[flagIndex] = bitflag; // bitflag placeholder
    do {
      if (imod === segmentationThreshold) {
        imod = 0;
        // Update bitflag placeholder
        packet[flagIndex] = bitflag;
        // Reset bitflag
        bitflag = 0;
        // Add in new placeholder
        flagIndex = packet.length;
        packet[flagIndex] = bitflag;
      }
      const prop = pre[i];
      if (flags[prop] === true) {
        packet.push(data[prop]);
        bitflag |= 1 << imod;
      }
      ++imod;
    } while (++i < prelen);
 
    packet[flagIndex] = bitflag;
 
    if (packet[flagIndex] === 0) packet.pop();
    
    return packet;
  }
 
  /**
   * @param {Object} packet
   */
  unpack (packet) {
    const req = this.req; // required
    const pre = this.pre; // precondition
    const reqlen = this.reqlen;
    const prelen = this.prelen;
    const packetLen = packet.length;
    const data = {};
    
    let i = 0;
    while (i++ < reqlen) {
      data[req[i-1]] = packet[i];
    }
 
    if (prelen === 0) return data;
 
    const segmentationThreshold = this.segmentationThreshold;
    const maxUnpackIterations = this.maxUnpackIterations;
    let totalFlagIter = 0; // actual iter of flag
    i = reqlen;
    while (i++) {
      let bitflag = packet[i];
      if (bitflag === undefined || i > maxUnpackIterations) break;
      let flagIter = 0; // iter of current flag segment
      do {
        if ((bitflag & (1 << flagIter)) !== 0) {
          data[pre[totalFlagIter]] = packet[++i];
        }
        ++totalFlagIter;
      } while (flagIter++ < segmentationThreshold);
    }
 
    return data;
  }
}