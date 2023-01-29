//
// zipcode-data
//
// Written by Will Brickner with love <3
//
module.exports = {
    stateFromZip: (zip) => { return __zipcode_data[zip][0] },
    cityFromZip:  (zip) => { return __zipcode_data[zip][1] },
    dstFromZip:   (zip) => { return __zipcode_data[zip][2] },
    isUSA:        (zip) => { return (typeof __zipcode_data[zip] === "undefined") },
    lookupZip:    (zip) => {
        let __tmp = __zipcode_data[zip];
        if (!__tmp) { return false }
        return {
            state: __tmp[0],
            city:  __tmp[1],
            dst:   __tmp[2]
        }
    }
}