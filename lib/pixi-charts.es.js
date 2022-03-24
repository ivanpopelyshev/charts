/* eslint-disable */
 
/*!
 * @pixi/charts - v0.2.3
 * Compiled Thu, 24 Mar 2022 12:08:47 UTC
 *
 * @pixi/charts is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 * 
 * Copyright 2019-2020, Konstantin Timoshenko, All Rights Reserved
 */
import { Program, Texture, Geometry, Buffer, Renderer, BatchRenderer } from '@pixi/core';
import { Point, Rectangle } from '@pixi/math';
import { DisplayObject, TemporaryDisplayObject, Container } from '@pixi/display';
import { EventEmitter, hex2string, rgb2hex, hex2rgb } from '@pixi/utils';
import { LINE_JOIN, LINE_CAP, Graphics } from '@pixi/graphics';
import { MeshMaterial, Mesh } from '@pixi/mesh';
import { TYPES as TYPES$1, MIPMAP_MODES as MIPMAP_MODES$1 } from '@pixi/constants';
import { Sprite } from '@pixi/sprite';

var appleIphone = /iPhone/i;
var appleIpod = /iPod/i;
var appleTablet = /iPad/i;
var appleUniversal = /\biOS-universal(?:.+)Mac\b/i;
var androidPhone = /\bAndroid(?:.+)Mobile\b/i;
var androidTablet = /Android/i;
var amazonPhone = /(?:SD4930UR|\bSilk(?:.+)Mobile\b)/i;
var amazonTablet = /Silk/i;
var windowsPhone = /Windows Phone/i;
var windowsTablet = /\bWindows(?:.+)ARM\b/i;
var otherBlackBerry = /BlackBerry/i;
var otherBlackBerry10 = /BB10/i;
var otherOpera = /Opera Mini/i;
var otherChrome = /\b(CriOS|Chrome)(?:.+)Mobile/i;
var otherFirefox = /Mobile(?:.+)Firefox\b/i;
var isAppleTabletOnIos13 = function (navigator) {
    return (typeof navigator !== 'undefined' &&
        navigator.platform === 'MacIntel' &&
        typeof navigator.maxTouchPoints === 'number' &&
        navigator.maxTouchPoints > 1 &&
        typeof MSStream === 'undefined');
};
function createMatch(userAgent) {
    return function (regex) { return regex.test(userAgent); };
}
function isMobile$1(param) {
    var nav = {
        userAgent: '',
        platform: '',
        maxTouchPoints: 0
    };
    if (!param && typeof navigator !== 'undefined') {
        nav = {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            maxTouchPoints: navigator.maxTouchPoints || 0
        };
    }
    else if (typeof param === 'string') {
        nav.userAgent = param;
    }
    else if (param && param.userAgent) {
        nav = {
            userAgent: param.userAgent,
            platform: param.platform,
            maxTouchPoints: param.maxTouchPoints || 0
        };
    }
    var userAgent = nav.userAgent;
    var tmp = userAgent.split('[FBAN');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }
    tmp = userAgent.split('Twitter');
    if (typeof tmp[1] !== 'undefined') {
        userAgent = tmp[0];
    }
    var match = createMatch(userAgent);
    var result = {
        apple: {
            phone: match(appleIphone) && !match(windowsPhone),
            ipod: match(appleIpod),
            tablet: !match(appleIphone) &&
                (match(appleTablet) || isAppleTabletOnIos13(nav)) &&
                !match(windowsPhone),
            universal: match(appleUniversal),
            device: (match(appleIphone) ||
                match(appleIpod) ||
                match(appleTablet) ||
                match(appleUniversal) ||
                isAppleTabletOnIos13(nav)) &&
                !match(windowsPhone)
        },
        amazon: {
            phone: match(amazonPhone),
            tablet: !match(amazonPhone) && match(amazonTablet),
            device: match(amazonPhone) || match(amazonTablet)
        },
        android: {
            phone: (!match(windowsPhone) && match(amazonPhone)) ||
                (!match(windowsPhone) && match(androidPhone)),
            tablet: !match(windowsPhone) &&
                !match(amazonPhone) &&
                !match(androidPhone) &&
                (match(amazonTablet) || match(androidTablet)),
            device: (!match(windowsPhone) &&
                (match(amazonPhone) ||
                    match(amazonTablet) ||
                    match(androidPhone) ||
                    match(androidTablet))) ||
                match(/\bokhttp\b/i)
        },
        windows: {
            phone: match(windowsPhone),
            tablet: match(windowsTablet),
            device: match(windowsPhone) || match(windowsTablet)
        },
        other: {
            blackberry: match(otherBlackBerry),
            blackberry10: match(otherBlackBerry10),
            opera: match(otherOpera),
            firefox: match(otherFirefox),
            chrome: match(otherChrome),
            device: match(otherBlackBerry) ||
                match(otherBlackBerry10) ||
                match(otherOpera) ||
                match(otherFirefox) ||
                match(otherChrome)
        },
        any: false,
        phone: false,
        tablet: false
    };
    result.any =
        result.apple.device ||
            result.android.device ||
            result.windows.device ||
            result.other.device;
    result.phone =
        result.apple.phone || result.android.phone || result.windows.phone;
    result.tablet =
        result.apple.tablet || result.android.tablet || result.windows.tablet;
    return result;
}

/*!
 * @pixi/settings - v6.1.3
 * Compiled Mon, 13 Sep 2021 15:29:31 UTC
 *
 * @pixi/settings is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

// The ESM/CJS versions of ismobilejs only
var isMobile = isMobile$1(self.navigator);

/**
 * The maximum recommended texture units to use.
 * In theory the bigger the better, and for desktop we'll use as many as we can.
 * But some mobile devices slow down if there is to many branches in the shader.
 * So in practice there seems to be a sweet spot size that varies depending on the device.
 *
 * In v4, all mobile devices were limited to 4 texture units because for this.
 * In v5, we allow all texture units to be used on modern Apple or Android devices.
 *
 * @private
 * @param {number} max
 * @returns {number}
 */
function maxRecommendedTextures(max) {
    var allowMax = true;
    if (isMobile.tablet || isMobile.phone) {
        if (isMobile.apple.device) {
            var match = (navigator.userAgent).match(/OS (\d+)_(\d+)?/);
            if (match) {
                var majorVersion = parseInt(match[1], 10);
                // Limit texture units on devices below iOS 11, which will be older hardware
                if (majorVersion < 11) {
                    allowMax = false;
                }
            }
        }
        if (isMobile.android.device) {
            var match = (navigator.userAgent).match(/Android\s([0-9.]*)/);
            if (match) {
                var majorVersion = parseInt(match[1], 10);
                // Limit texture units on devices below Android 7 (Nougat), which will be older hardware
                if (majorVersion < 7) {
                    allowMax = false;
                }
            }
        }
    }
    return allowMax ? max : 4;
}

/**
 * Uploading the same buffer multiple times in a single frame can cause performance issues.
 * Apparent on iOS so only check for that at the moment
 * This check may become more complex if this issue pops up elsewhere.
 *
 * @private
 * @returns {boolean}
 */
function canUploadSameBuffer() {
    return !isMobile.apple.device;
}

/*!
 * @pixi/constants - v6.1.3
 * Compiled Mon, 13 Sep 2021 15:29:31 UTC
 *
 * @pixi/constants is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */
/**
 * Different types of environments for WebGL.
 *
 * @static
 * @memberof PIXI
 * @name ENV
 * @enum {number}
 * @property {number} WEBGL_LEGACY - Used for older v1 WebGL devices. PixiJS will aim to ensure compatibility
 *  with older / less advanced devices. If you experience unexplained flickering prefer this environment.
 * @property {number} WEBGL - Version 1 of WebGL
 * @property {number} WEBGL2 - Version 2 of WebGL
 */
var ENV;
(function (ENV) {
    ENV[ENV["WEBGL_LEGACY"] = 0] = "WEBGL_LEGACY";
    ENV[ENV["WEBGL"] = 1] = "WEBGL";
    ENV[ENV["WEBGL2"] = 2] = "WEBGL2";
})(ENV || (ENV = {}));
/**
 * Constant to identify the Renderer Type.
 *
 * @static
 * @memberof PIXI
 * @name RENDERER_TYPE
 * @enum {number}
 * @property {number} UNKNOWN - Unknown render type.
 * @property {number} WEBGL - WebGL render type.
 * @property {number} CANVAS - Canvas render type.
 */
var RENDERER_TYPE;
(function (RENDERER_TYPE) {
    RENDERER_TYPE[RENDERER_TYPE["UNKNOWN"] = 0] = "UNKNOWN";
    RENDERER_TYPE[RENDERER_TYPE["WEBGL"] = 1] = "WEBGL";
    RENDERER_TYPE[RENDERER_TYPE["CANVAS"] = 2] = "CANVAS";
})(RENDERER_TYPE || (RENDERER_TYPE = {}));
/**
 * Bitwise OR of masks that indicate the buffers to be cleared.
 *
 * @static
 * @memberof PIXI
 * @name BUFFER_BITS
 * @enum {number}
 * @property {number} COLOR - Indicates the buffers currently enabled for color writing.
 * @property {number} DEPTH - Indicates the depth buffer.
 * @property {number} STENCIL - Indicates the stencil buffer.
 */
var BUFFER_BITS;
(function (BUFFER_BITS) {
    BUFFER_BITS[BUFFER_BITS["COLOR"] = 16384] = "COLOR";
    BUFFER_BITS[BUFFER_BITS["DEPTH"] = 256] = "DEPTH";
    BUFFER_BITS[BUFFER_BITS["STENCIL"] = 1024] = "STENCIL";
})(BUFFER_BITS || (BUFFER_BITS = {}));
/**
 * Various blend modes supported by PIXI.
 *
 * IMPORTANT - The WebGL renderer only supports the NORMAL, ADD, MULTIPLY and SCREEN blend modes.
 * Anything else will silently act like NORMAL.
 *
 * @memberof PIXI
 * @name BLEND_MODES
 * @enum {number}
 * @property {number} NORMAL
 * @property {number} ADD
 * @property {number} MULTIPLY
 * @property {number} SCREEN
 * @property {number} OVERLAY
 * @property {number} DARKEN
 * @property {number} LIGHTEN
 * @property {number} COLOR_DODGE
 * @property {number} COLOR_BURN
 * @property {number} HARD_LIGHT
 * @property {number} SOFT_LIGHT
 * @property {number} DIFFERENCE
 * @property {number} EXCLUSION
 * @property {number} HUE
 * @property {number} SATURATION
 * @property {number} COLOR
 * @property {number} LUMINOSITY
 * @property {number} NORMAL_NPM
 * @property {number} ADD_NPM
 * @property {number} SCREEN_NPM
 * @property {number} NONE
 * @property {number} SRC_IN
 * @property {number} SRC_OUT
 * @property {number} SRC_ATOP
 * @property {number} DST_OVER
 * @property {number} DST_IN
 * @property {number} DST_OUT
 * @property {number} DST_ATOP
 * @property {number} SUBTRACT
 * @property {number} SRC_OVER
 * @property {number} ERASE
 * @property {number} XOR
 */
var BLEND_MODES;
(function (BLEND_MODES) {
    BLEND_MODES[BLEND_MODES["NORMAL"] = 0] = "NORMAL";
    BLEND_MODES[BLEND_MODES["ADD"] = 1] = "ADD";
    BLEND_MODES[BLEND_MODES["MULTIPLY"] = 2] = "MULTIPLY";
    BLEND_MODES[BLEND_MODES["SCREEN"] = 3] = "SCREEN";
    BLEND_MODES[BLEND_MODES["OVERLAY"] = 4] = "OVERLAY";
    BLEND_MODES[BLEND_MODES["DARKEN"] = 5] = "DARKEN";
    BLEND_MODES[BLEND_MODES["LIGHTEN"] = 6] = "LIGHTEN";
    BLEND_MODES[BLEND_MODES["COLOR_DODGE"] = 7] = "COLOR_DODGE";
    BLEND_MODES[BLEND_MODES["COLOR_BURN"] = 8] = "COLOR_BURN";
    BLEND_MODES[BLEND_MODES["HARD_LIGHT"] = 9] = "HARD_LIGHT";
    BLEND_MODES[BLEND_MODES["SOFT_LIGHT"] = 10] = "SOFT_LIGHT";
    BLEND_MODES[BLEND_MODES["DIFFERENCE"] = 11] = "DIFFERENCE";
    BLEND_MODES[BLEND_MODES["EXCLUSION"] = 12] = "EXCLUSION";
    BLEND_MODES[BLEND_MODES["HUE"] = 13] = "HUE";
    BLEND_MODES[BLEND_MODES["SATURATION"] = 14] = "SATURATION";
    BLEND_MODES[BLEND_MODES["COLOR"] = 15] = "COLOR";
    BLEND_MODES[BLEND_MODES["LUMINOSITY"] = 16] = "LUMINOSITY";
    BLEND_MODES[BLEND_MODES["NORMAL_NPM"] = 17] = "NORMAL_NPM";
    BLEND_MODES[BLEND_MODES["ADD_NPM"] = 18] = "ADD_NPM";
    BLEND_MODES[BLEND_MODES["SCREEN_NPM"] = 19] = "SCREEN_NPM";
    BLEND_MODES[BLEND_MODES["NONE"] = 20] = "NONE";
    BLEND_MODES[BLEND_MODES["SRC_OVER"] = 0] = "SRC_OVER";
    BLEND_MODES[BLEND_MODES["SRC_IN"] = 21] = "SRC_IN";
    BLEND_MODES[BLEND_MODES["SRC_OUT"] = 22] = "SRC_OUT";
    BLEND_MODES[BLEND_MODES["SRC_ATOP"] = 23] = "SRC_ATOP";
    BLEND_MODES[BLEND_MODES["DST_OVER"] = 24] = "DST_OVER";
    BLEND_MODES[BLEND_MODES["DST_IN"] = 25] = "DST_IN";
    BLEND_MODES[BLEND_MODES["DST_OUT"] = 26] = "DST_OUT";
    BLEND_MODES[BLEND_MODES["DST_ATOP"] = 27] = "DST_ATOP";
    BLEND_MODES[BLEND_MODES["ERASE"] = 26] = "ERASE";
    BLEND_MODES[BLEND_MODES["SUBTRACT"] = 28] = "SUBTRACT";
    BLEND_MODES[BLEND_MODES["XOR"] = 29] = "XOR";
})(BLEND_MODES || (BLEND_MODES = {}));
/**
 * Various webgl draw modes. These can be used to specify which GL drawMode to use
 * under certain situations and renderers.
 *
 * @memberof PIXI
 * @static
 * @name DRAW_MODES
 * @enum {number}
 * @property {number} POINTS
 * @property {number} LINES
 * @property {number} LINE_LOOP
 * @property {number} LINE_STRIP
 * @property {number} TRIANGLES
 * @property {number} TRIANGLE_STRIP
 * @property {number} TRIANGLE_FAN
 */
var DRAW_MODES;
(function (DRAW_MODES) {
    DRAW_MODES[DRAW_MODES["POINTS"] = 0] = "POINTS";
    DRAW_MODES[DRAW_MODES["LINES"] = 1] = "LINES";
    DRAW_MODES[DRAW_MODES["LINE_LOOP"] = 2] = "LINE_LOOP";
    DRAW_MODES[DRAW_MODES["LINE_STRIP"] = 3] = "LINE_STRIP";
    DRAW_MODES[DRAW_MODES["TRIANGLES"] = 4] = "TRIANGLES";
    DRAW_MODES[DRAW_MODES["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    DRAW_MODES[DRAW_MODES["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
})(DRAW_MODES || (DRAW_MODES = {}));
/**
 * Various GL texture/resources formats.
 *
 * @memberof PIXI
 * @static
 * @name FORMATS
 * @enum {number}
 * @property {number} RGBA=6408
 * @property {number} RGB=6407
 * @property {number} RG=33319
 * @property {number} RED=6403
 * @property {number} RGBA_INTEGER=36249
 * @property {number} RGB_INTEGER=36248
 * @property {number} RG_INTEGER=33320
 * @property {number} RED_INTEGER=36244
 * @property {number} ALPHA=6406
 * @property {number} LUMINANCE=6409
 * @property {number} LUMINANCE_ALPHA=6410
 * @property {number} DEPTH_COMPONENT=6402
 * @property {number} DEPTH_STENCIL=34041
 */
var FORMATS;
(function (FORMATS) {
    FORMATS[FORMATS["RGBA"] = 6408] = "RGBA";
    FORMATS[FORMATS["RGB"] = 6407] = "RGB";
    FORMATS[FORMATS["RG"] = 33319] = "RG";
    FORMATS[FORMATS["RED"] = 6403] = "RED";
    FORMATS[FORMATS["RGBA_INTEGER"] = 36249] = "RGBA_INTEGER";
    FORMATS[FORMATS["RGB_INTEGER"] = 36248] = "RGB_INTEGER";
    FORMATS[FORMATS["RG_INTEGER"] = 33320] = "RG_INTEGER";
    FORMATS[FORMATS["RED_INTEGER"] = 36244] = "RED_INTEGER";
    FORMATS[FORMATS["ALPHA"] = 6406] = "ALPHA";
    FORMATS[FORMATS["LUMINANCE"] = 6409] = "LUMINANCE";
    FORMATS[FORMATS["LUMINANCE_ALPHA"] = 6410] = "LUMINANCE_ALPHA";
    FORMATS[FORMATS["DEPTH_COMPONENT"] = 6402] = "DEPTH_COMPONENT";
    FORMATS[FORMATS["DEPTH_STENCIL"] = 34041] = "DEPTH_STENCIL";
})(FORMATS || (FORMATS = {}));
/**
 * Various GL target types.
 *
 * @memberof PIXI
 * @static
 * @name TARGETS
 * @enum {number}
 * @property {number} TEXTURE_2D=3553
 * @property {number} TEXTURE_CUBE_MAP=34067
 * @property {number} TEXTURE_2D_ARRAY=35866
 * @property {number} TEXTURE_CUBE_MAP_POSITIVE_X=34069
 * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_X=34070
 * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Y=34071
 * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Y=34072
 * @property {number} TEXTURE_CUBE_MAP_POSITIVE_Z=34073
 * @property {number} TEXTURE_CUBE_MAP_NEGATIVE_Z=34074
 */
var TARGETS;
(function (TARGETS) {
    TARGETS[TARGETS["TEXTURE_2D"] = 3553] = "TEXTURE_2D";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP"] = 34067] = "TEXTURE_CUBE_MAP";
    TARGETS[TARGETS["TEXTURE_2D_ARRAY"] = 35866] = "TEXTURE_2D_ARRAY";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_X"] = 34069] = "TEXTURE_CUBE_MAP_POSITIVE_X";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_X"] = 34070] = "TEXTURE_CUBE_MAP_NEGATIVE_X";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Y"] = 34071] = "TEXTURE_CUBE_MAP_POSITIVE_Y";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Y"] = 34072] = "TEXTURE_CUBE_MAP_NEGATIVE_Y";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_POSITIVE_Z"] = 34073] = "TEXTURE_CUBE_MAP_POSITIVE_Z";
    TARGETS[TARGETS["TEXTURE_CUBE_MAP_NEGATIVE_Z"] = 34074] = "TEXTURE_CUBE_MAP_NEGATIVE_Z";
})(TARGETS || (TARGETS = {}));
/**
 * Various GL data format types.
 *
 * @memberof PIXI
 * @static
 * @name TYPES
 * @enum {number}
 * @property {number} UNSIGNED_BYTE=5121
 * @property {number} UNSIGNED_SHORT=5123
 * @property {number} UNSIGNED_SHORT_5_6_5=33635
 * @property {number} UNSIGNED_SHORT_4_4_4_4=32819
 * @property {number} UNSIGNED_SHORT_5_5_5_1=32820
 * @property {number} UNSIGNED_INT=5125
 * @property {number} UNSIGNED_INT_10F_11F_11F_REV=35899
 * @property {number} UNSIGNED_INT_2_10_10_10_REV=33640
 * @property {number} UNSIGNED_INT_24_8=34042
 * @property {number} UNSIGNED_INT_5_9_9_9_REV=35902
 * @property {number} BYTE=5120
 * @property {number} SHORT=5122
 * @property {number} INT=5124
 * @property {number} FLOAT=5126
 * @property {number} FLOAT_32_UNSIGNED_INT_24_8_REV=36269
 * @property {number} HALF_FLOAT=36193
 */
var TYPES;
(function (TYPES) {
    TYPES[TYPES["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    TYPES[TYPES["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    TYPES[TYPES["UNSIGNED_SHORT_5_6_5"] = 33635] = "UNSIGNED_SHORT_5_6_5";
    TYPES[TYPES["UNSIGNED_SHORT_4_4_4_4"] = 32819] = "UNSIGNED_SHORT_4_4_4_4";
    TYPES[TYPES["UNSIGNED_SHORT_5_5_5_1"] = 32820] = "UNSIGNED_SHORT_5_5_5_1";
    TYPES[TYPES["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    TYPES[TYPES["UNSIGNED_INT_10F_11F_11F_REV"] = 35899] = "UNSIGNED_INT_10F_11F_11F_REV";
    TYPES[TYPES["UNSIGNED_INT_2_10_10_10_REV"] = 33640] = "UNSIGNED_INT_2_10_10_10_REV";
    TYPES[TYPES["UNSIGNED_INT_24_8"] = 34042] = "UNSIGNED_INT_24_8";
    TYPES[TYPES["UNSIGNED_INT_5_9_9_9_REV"] = 35902] = "UNSIGNED_INT_5_9_9_9_REV";
    TYPES[TYPES["BYTE"] = 5120] = "BYTE";
    TYPES[TYPES["SHORT"] = 5122] = "SHORT";
    TYPES[TYPES["INT"] = 5124] = "INT";
    TYPES[TYPES["FLOAT"] = 5126] = "FLOAT";
    TYPES[TYPES["FLOAT_32_UNSIGNED_INT_24_8_REV"] = 36269] = "FLOAT_32_UNSIGNED_INT_24_8_REV";
    TYPES[TYPES["HALF_FLOAT"] = 36193] = "HALF_FLOAT";
})(TYPES || (TYPES = {}));
/**
 * Various sampler types. Correspond to `sampler`, `isampler`, `usampler` GLSL types respectively.
 * WebGL1 works only with FLOAT.
 *
 * @memberof PIXI
 * @static
 * @name SAMPLER_TYPES
 * @enum {number}
 * @property {number} FLOAT=0
 * @property {number} INT=1
 * @property {number} UINT=2
 */
var SAMPLER_TYPES;
(function (SAMPLER_TYPES) {
    SAMPLER_TYPES[SAMPLER_TYPES["FLOAT"] = 0] = "FLOAT";
    SAMPLER_TYPES[SAMPLER_TYPES["INT"] = 1] = "INT";
    SAMPLER_TYPES[SAMPLER_TYPES["UINT"] = 2] = "UINT";
})(SAMPLER_TYPES || (SAMPLER_TYPES = {}));
/**
 * The scale modes that are supported by pixi.
 *
 * The {@link PIXI.settings.SCALE_MODE} scale mode affects the default scaling mode of future operations.
 * It can be re-assigned to either LINEAR or NEAREST, depending upon suitability.
 *
 * @memberof PIXI
 * @static
 * @name SCALE_MODES
 * @enum {number}
 * @property {number} LINEAR Smooth scaling
 * @property {number} NEAREST Pixelating scaling
 */
var SCALE_MODES;
(function (SCALE_MODES) {
    SCALE_MODES[SCALE_MODES["NEAREST"] = 0] = "NEAREST";
    SCALE_MODES[SCALE_MODES["LINEAR"] = 1] = "LINEAR";
})(SCALE_MODES || (SCALE_MODES = {}));
/**
 * The wrap modes that are supported by pixi.
 *
 * The {@link PIXI.settings.WRAP_MODE} wrap mode affects the default wrapping mode of future operations.
 * It can be re-assigned to either CLAMP or REPEAT, depending upon suitability.
 * If the texture is non power of two then clamp will be used regardless as WebGL can
 * only use REPEAT if the texture is po2.
 *
 * This property only affects WebGL.
 *
 * @name WRAP_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} CLAMP - The textures uvs are clamped
 * @property {number} REPEAT - The texture uvs tile and repeat
 * @property {number} MIRRORED_REPEAT - The texture uvs tile and repeat with mirroring
 */
var WRAP_MODES;
(function (WRAP_MODES) {
    WRAP_MODES[WRAP_MODES["CLAMP"] = 33071] = "CLAMP";
    WRAP_MODES[WRAP_MODES["REPEAT"] = 10497] = "REPEAT";
    WRAP_MODES[WRAP_MODES["MIRRORED_REPEAT"] = 33648] = "MIRRORED_REPEAT";
})(WRAP_MODES || (WRAP_MODES = {}));
/**
 * Mipmap filtering modes that are supported by pixi.
 *
 * The {@link PIXI.settings.MIPMAP_TEXTURES} affects default texture filtering.
 * Mipmaps are generated for a baseTexture if its `mipmap` field is `ON`,
 * or its `POW2` and texture dimensions are powers of 2.
 * Due to platform restriction, `ON` option will work like `POW2` for webgl-1.
 *
 * This property only affects WebGL.
 *
 * @name MIPMAP_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} OFF - No mipmaps
 * @property {number} POW2 - Generate mipmaps if texture dimensions are pow2
 * @property {number} ON - Always generate mipmaps
 * @property {number} ON_MANUAL - Use mipmaps, but do not auto-generate them; this is used with a resource
 *   that supports buffering each level-of-detail.
 */
var MIPMAP_MODES;
(function (MIPMAP_MODES) {
    MIPMAP_MODES[MIPMAP_MODES["OFF"] = 0] = "OFF";
    MIPMAP_MODES[MIPMAP_MODES["POW2"] = 1] = "POW2";
    MIPMAP_MODES[MIPMAP_MODES["ON"] = 2] = "ON";
    MIPMAP_MODES[MIPMAP_MODES["ON_MANUAL"] = 3] = "ON_MANUAL";
})(MIPMAP_MODES || (MIPMAP_MODES = {}));
/**
 * How to treat textures with premultiplied alpha
 *
 * @name ALPHA_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NO_PREMULTIPLIED_ALPHA - Source is not premultiplied, leave it like that.
 *  Option for compressed and data textures that are created from typed arrays.
 * @property {number} PREMULTIPLY_ON_UPLOAD - Source is not premultiplied, premultiply on upload.
 *  Default option, used for all loaded images.
 * @property {number} PREMULTIPLIED_ALPHA - Source is already premultiplied
 *  Example: spine atlases with `_pma` suffix.
 * @property {number} NPM - Alias for NO_PREMULTIPLIED_ALPHA.
 * @property {number} UNPACK - Default option, alias for PREMULTIPLY_ON_UPLOAD.
 * @property {number} PMA - Alias for PREMULTIPLIED_ALPHA.
 */
var ALPHA_MODES;
(function (ALPHA_MODES) {
    ALPHA_MODES[ALPHA_MODES["NPM"] = 0] = "NPM";
    ALPHA_MODES[ALPHA_MODES["UNPACK"] = 1] = "UNPACK";
    ALPHA_MODES[ALPHA_MODES["PMA"] = 2] = "PMA";
    ALPHA_MODES[ALPHA_MODES["NO_PREMULTIPLIED_ALPHA"] = 0] = "NO_PREMULTIPLIED_ALPHA";
    ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ON_UPLOAD"] = 1] = "PREMULTIPLY_ON_UPLOAD";
    ALPHA_MODES[ALPHA_MODES["PREMULTIPLY_ALPHA"] = 2] = "PREMULTIPLY_ALPHA";
})(ALPHA_MODES || (ALPHA_MODES = {}));
/**
 * Configure whether filter textures are cleared after binding.
 *
 * Filter textures need not be cleared if the filter does not use pixel blending. {@link CLEAR_MODES.BLIT} will detect
 * this and skip clearing as an optimization.
 *
 * @name CLEAR_MODES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} BLEND - Do not clear the filter texture. The filter's output will blend on top of the output texture.
 * @property {number} CLEAR - Always clear the filter texture.
 * @property {number} BLIT - Clear only if {@link FilterSystem.forceClear} is set or if the filter uses pixel blending.
 * @property {number} NO - Alias for BLEND, same as `false` in earlier versions
 * @property {number} YES - Alias for CLEAR, same as `true` in earlier versions
 * @property {number} AUTO - Alias for BLIT
 */
var CLEAR_MODES;
(function (CLEAR_MODES) {
    CLEAR_MODES[CLEAR_MODES["NO"] = 0] = "NO";
    CLEAR_MODES[CLEAR_MODES["YES"] = 1] = "YES";
    CLEAR_MODES[CLEAR_MODES["AUTO"] = 2] = "AUTO";
    CLEAR_MODES[CLEAR_MODES["BLEND"] = 0] = "BLEND";
    CLEAR_MODES[CLEAR_MODES["CLEAR"] = 1] = "CLEAR";
    CLEAR_MODES[CLEAR_MODES["BLIT"] = 2] = "BLIT";
})(CLEAR_MODES || (CLEAR_MODES = {}));
/**
 * The gc modes that are supported by pixi.
 *
 * The {@link PIXI.settings.GC_MODE} Garbage Collection mode for PixiJS textures is AUTO
 * If set to GC_MODE, the renderer will occasionally check textures usage. If they are not
 * used for a specified period of time they will be removed from the GPU. They will of course
 * be uploaded again when they are required. This is a silent behind the scenes process that
 * should ensure that the GPU does not  get filled up.
 *
 * Handy for mobile devices!
 * This property only affects WebGL.
 *
 * @name GC_MODES
 * @enum {number}
 * @static
 * @memberof PIXI
 * @property {number} AUTO - Garbage collection will happen periodically automatically
 * @property {number} MANUAL - Garbage collection will need to be called manually
 */
var GC_MODES;
(function (GC_MODES) {
    GC_MODES[GC_MODES["AUTO"] = 0] = "AUTO";
    GC_MODES[GC_MODES["MANUAL"] = 1] = "MANUAL";
})(GC_MODES || (GC_MODES = {}));
/**
 * Constants that specify float precision in shaders.
 *
 * @name PRECISION
 * @memberof PIXI
 * @constant
 * @static
 * @enum {string}
 * @property {string} LOW='lowp'
 * @property {string} MEDIUM='mediump'
 * @property {string} HIGH='highp'
 */
var PRECISION;
(function (PRECISION) {
    PRECISION["LOW"] = "lowp";
    PRECISION["MEDIUM"] = "mediump";
    PRECISION["HIGH"] = "highp";
})(PRECISION || (PRECISION = {}));
/**
 * Constants for mask implementations.
 * We use `type` suffix because it leads to very different behaviours
 *
 * @name MASK_TYPES
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NONE - Mask is ignored
 * @property {number} SCISSOR - Scissor mask, rectangle on screen, cheap
 * @property {number} STENCIL - Stencil mask, 1-bit, medium, works only if renderer supports stencil
 * @property {number} SPRITE - Mask that uses SpriteMaskFilter, uses temporary RenderTexture
 */
var MASK_TYPES;
(function (MASK_TYPES) {
    MASK_TYPES[MASK_TYPES["NONE"] = 0] = "NONE";
    MASK_TYPES[MASK_TYPES["SCISSOR"] = 1] = "SCISSOR";
    MASK_TYPES[MASK_TYPES["STENCIL"] = 2] = "STENCIL";
    MASK_TYPES[MASK_TYPES["SPRITE"] = 3] = "SPRITE";
})(MASK_TYPES || (MASK_TYPES = {}));
/**
 * Constants for multi-sampling antialiasing.
 *
 * @see PIXI.Framebuffer#multisample
 *
 * @name MSAA_QUALITY
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} NONE - No multisampling for this renderTexture
 * @property {number} LOW - Try 2 samples
 * @property {number} MEDIUM - Try 4 samples
 * @property {number} HIGH - Try 8 samples
 */
var MSAA_QUALITY;
(function (MSAA_QUALITY) {
    MSAA_QUALITY[MSAA_QUALITY["NONE"] = 0] = "NONE";
    MSAA_QUALITY[MSAA_QUALITY["LOW"] = 2] = "LOW";
    MSAA_QUALITY[MSAA_QUALITY["MEDIUM"] = 4] = "MEDIUM";
    MSAA_QUALITY[MSAA_QUALITY["HIGH"] = 8] = "HIGH";
})(MSAA_QUALITY || (MSAA_QUALITY = {}));
/**
 * Constants for various buffer types in Pixi
 *
 * @see PIXI.BUFFER_TYPE
 *
 * @name BUFFER_TYPE
 * @memberof PIXI
 * @static
 * @enum {number}
 * @property {number} ELEMENT_ARRAY_BUFFER - buffer type for using as an index buffer
 * @property {number} ARRAY_BUFFER - buffer type for using attribute data
 * @property {number} UNIFORM_BUFFER - the buffer type is for uniform buffer objects
 */
var BUFFER_TYPE;
(function (BUFFER_TYPE) {
    BUFFER_TYPE[BUFFER_TYPE["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
    BUFFER_TYPE[BUFFER_TYPE["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
    // NOT YET SUPPORTED
    BUFFER_TYPE[BUFFER_TYPE["UNIFORM_BUFFER"] = 35345] = "UNIFORM_BUFFER";
})(BUFFER_TYPE || (BUFFER_TYPE = {}));

/**
 * User's customizable globals for overriding the default PIXI settings, such
 * as a renderer's default resolution, framerate, float precision, etc.
 * @example
 * // Use the native window resolution as the default resolution
 * // will support high-density displays when rendering
 * PIXI.settings.RESOLUTION = window.devicePixelRatio;
 *
 * // Disable interpolation when scaling, will make texture be pixelated
 * PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
 * @namespace PIXI.settings
 */
var settings = {
    /**
     * If set to true WebGL will attempt make textures mimpaped by default.
     * Mipmapping will only succeed if the base texture uploaded has power of two dimensions.
     *
     * @static
     * @name MIPMAP_TEXTURES
     * @memberof PIXI.settings
     * @type {PIXI.MIPMAP_MODES}
     * @default PIXI.MIPMAP_MODES.POW2
     */
    MIPMAP_TEXTURES: MIPMAP_MODES.POW2,
    /**
     * Default anisotropic filtering level of textures.
     * Usually from 0 to 16
     *
     * @static
     * @name ANISOTROPIC_LEVEL
     * @memberof PIXI.settings
     * @type {number}
     * @default 0
     */
    ANISOTROPIC_LEVEL: 0,
    /**
     * Default resolution / device pixel ratio of the renderer.
     *
     * @static
     * @name RESOLUTION
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    RESOLUTION: 1,
    /**
     * Default filter resolution.
     *
     * @static
     * @name FILTER_RESOLUTION
     * @memberof PIXI.settings
     * @type {number}
     * @default 1
     */
    FILTER_RESOLUTION: 1,
    /**
     * Default filter samples.
     *
     * @static
     * @name FILTER_MULTISAMPLE
     * @memberof PIXI.settings
     * @type {PIXI.MSAA_QUALITY}
     * @default PIXI.MSAA_QUALITY.NONE
     */
    FILTER_MULTISAMPLE: MSAA_QUALITY.NONE,
    /**
     * The maximum textures that this device supports.
     *
     * @static
     * @name SPRITE_MAX_TEXTURES
     * @memberof PIXI.settings
     * @type {number}
     * @default 32
     */
    SPRITE_MAX_TEXTURES: maxRecommendedTextures(32),
    // TODO: maybe change to SPRITE.BATCH_SIZE: 2000
    // TODO: maybe add PARTICLE.BATCH_SIZE: 15000
    /**
     * The default sprite batch size.
     *
     * The default aims to balance desktop and mobile devices.
     *
     * @static
     * @name SPRITE_BATCH_SIZE
     * @memberof PIXI.settings
     * @type {number}
     * @default 4096
     */
    SPRITE_BATCH_SIZE: 4096,
    /**
     * The default render options if none are supplied to {@link PIXI.Renderer}
     * or {@link PIXI.CanvasRenderer}.
     *
     * @static
     * @name RENDER_OPTIONS
     * @memberof PIXI.settings
     * @type {object}
     * @property {HTMLCanvasElement} view=null
     * @property {boolean} antialias=false
     * @property {boolean} autoDensity=false
     * @property {boolean} useContextAlpha=true
     * @property {number} backgroundColor=0x000000
     * @property {number} backgroundAlpha=1
     * @property {boolean} clearBeforeRender=true
     * @property {boolean} preserveDrawingBuffer=false
     * @property {number} width=800
     * @property {number} height=600
     * @property {boolean} legacy=false
     */
    RENDER_OPTIONS: {
        view: null,
        antialias: false,
        autoDensity: false,
        backgroundColor: 0x000000,
        backgroundAlpha: 1,
        useContextAlpha: true,
        clearBeforeRender: true,
        preserveDrawingBuffer: false,
        width: 800,
        height: 600,
        legacy: false,
    },
    /**
     * Default Garbage Collection mode.
     *
     * @static
     * @name GC_MODE
     * @memberof PIXI.settings
     * @type {PIXI.GC_MODES}
     * @default PIXI.GC_MODES.AUTO
     */
    GC_MODE: GC_MODES.AUTO,
    /**
     * Default Garbage Collection max idle.
     *
     * @static
     * @name GC_MAX_IDLE
     * @memberof PIXI.settings
     * @type {number}
     * @default 3600
     */
    GC_MAX_IDLE: 60 * 60,
    /**
     * Default Garbage Collection maximum check count.
     *
     * @static
     * @name GC_MAX_CHECK_COUNT
     * @memberof PIXI.settings
     * @type {number}
     * @default 600
     */
    GC_MAX_CHECK_COUNT: 60 * 10,
    /**
     * Default wrap modes that are supported by pixi.
     *
     * @static
     * @name WRAP_MODE
     * @memberof PIXI.settings
     * @type {PIXI.WRAP_MODES}
     * @default PIXI.WRAP_MODES.CLAMP
     */
    WRAP_MODE: WRAP_MODES.CLAMP,
    /**
     * Default scale mode for textures.
     *
     * @static
     * @name SCALE_MODE
     * @memberof PIXI.settings
     * @type {PIXI.SCALE_MODES}
     * @default PIXI.SCALE_MODES.LINEAR
     */
    SCALE_MODE: SCALE_MODES.LINEAR,
    /**
     * Default specify float precision in vertex shader.
     *
     * @static
     * @name PRECISION_VERTEX
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.HIGH
     */
    PRECISION_VERTEX: PRECISION.HIGH,
    /**
     * Default specify float precision in fragment shader.
     * iOS is best set at highp due to https://github.com/pixijs/pixi.js/issues/3742
     *
     * @static
     * @name PRECISION_FRAGMENT
     * @memberof PIXI.settings
     * @type {PIXI.PRECISION}
     * @default PIXI.PRECISION.MEDIUM
     */
    PRECISION_FRAGMENT: isMobile.apple.device ? PRECISION.HIGH : PRECISION.MEDIUM,
    /**
     * Can we upload the same buffer in a single frame?
     *
     * @static
     * @name CAN_UPLOAD_SAME_BUFFER
     * @memberof PIXI.settings
     * @type {boolean}
     */
    CAN_UPLOAD_SAME_BUFFER: canUploadSameBuffer(),
    /**
     * Enables bitmap creation before image load. This feature is experimental.
     *
     * @static
     * @name CREATE_IMAGE_BITMAP
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    CREATE_IMAGE_BITMAP: false,
    /**
     * If true PixiJS will Math.floor() x/y values when rendering, stopping pixel interpolation.
     * Advantages can include sharper image quality (like text) and faster rendering on canvas.
     * The main disadvantage is movement of objects may appear less smooth.
     *
     * @static
     * @constant
     * @memberof PIXI.settings
     * @type {boolean}
     * @default false
     */
    ROUND_PIXELS: false,
};

/*!
 * @pixi/ticker - v6.1.3
 * Compiled Mon, 13 Sep 2021 15:29:31 UTC
 *
 * @pixi/ticker is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

/**
 * Target frames per millisecond.
 *
 * @static
 * @name TARGET_FPMS
 * @memberof PIXI.settings
 * @type {number}
 * @default 0.06
 */
settings.TARGET_FPMS = 0.06;

/**
 * Represents the update priorities used by internal PIXI classes when registered with
 * the {@link PIXI.Ticker} object. Higher priority items are updated first and lower
 * priority items, such as render, should go later.
 *
 * @static
 * @constant
 * @name UPDATE_PRIORITY
 * @memberof PIXI
 * @enum {number}
 * @property {number} INTERACTION=50 Highest priority, used for {@link PIXI.InteractionManager}
 * @property {number} HIGH=25 High priority updating, {@link PIXI.VideoBaseTexture} and {@link PIXI.AnimatedSprite}
 * @property {number} NORMAL=0 Default priority for ticker events, see {@link PIXI.Ticker#add}.
 * @property {number} LOW=-25 Low priority used for {@link PIXI.Application} rendering.
 * @property {number} UTILITY=-50 Lowest priority used for {@link PIXI.BasePrepare} utility.
 */
var UPDATE_PRIORITY;
(function (UPDATE_PRIORITY) {
    UPDATE_PRIORITY[UPDATE_PRIORITY["INTERACTION"] = 50] = "INTERACTION";
    UPDATE_PRIORITY[UPDATE_PRIORITY["HIGH"] = 25] = "HIGH";
    UPDATE_PRIORITY[UPDATE_PRIORITY["NORMAL"] = 0] = "NORMAL";
    UPDATE_PRIORITY[UPDATE_PRIORITY["LOW"] = -25] = "LOW";
    UPDATE_PRIORITY[UPDATE_PRIORITY["UTILITY"] = -50] = "UTILITY";
})(UPDATE_PRIORITY || (UPDATE_PRIORITY = {}));

/**
 * Internal class for handling the priority sorting of ticker handlers.
 *
 * @private
 * @class
 * @memberof PIXI
 */
var TickerListener = /** @class */ (function () {
    /**
     * Constructor
     * @private
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @param priority - The priority for emitting
     * @param once - If the handler should fire once
     */
    function TickerListener(fn, context, priority, once) {
        if (context === void 0) { context = null; }
        if (priority === void 0) { priority = 0; }
        if (once === void 0) { once = false; }
        /** The next item in chain. */
        this.next = null;
        /** The previous item in chain. */
        this.previous = null;
        /** `true` if this listener has been destroyed already. */
        this._destroyed = false;
        this.fn = fn;
        this.context = context;
        this.priority = priority;
        this.once = once;
    }
    /**
     * Simple compare function to figure out if a function and context match.
     * @private
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @return `true` if the listener match the arguments
     */
    TickerListener.prototype.match = function (fn, context) {
        if (context === void 0) { context = null; }
        return this.fn === fn && this.context === context;
    };
    /**
     * Emit by calling the current function.
     * @private
     * @param deltaTime - time since the last emit.
     * @return Next ticker
     */
    TickerListener.prototype.emit = function (deltaTime) {
        if (this.fn) {
            if (this.context) {
                this.fn.call(this.context, deltaTime);
            }
            else {
                this.fn(deltaTime);
            }
        }
        var redirect = this.next;
        if (this.once) {
            this.destroy(true);
        }
        // Soft-destroying should remove
        // the next reference
        if (this._destroyed) {
            this.next = null;
        }
        return redirect;
    };
    /**
     * Connect to the list.
     * @private
     * @param previous - Input node, previous listener
     */
    TickerListener.prototype.connect = function (previous) {
        this.previous = previous;
        if (previous.next) {
            previous.next.previous = this;
        }
        this.next = previous.next;
        previous.next = this;
    };
    /**
     * Destroy and don't use after this.
     * @private
     * @param hard - `true` to remove the `next` reference, this
     *        is considered a hard destroy. Soft destroy maintains the next reference.
     * @return The listener to redirect while emitting or removing.
     */
    TickerListener.prototype.destroy = function (hard) {
        if (hard === void 0) { hard = false; }
        this._destroyed = true;
        this.fn = null;
        this.context = null;
        // Disconnect, hook up next and previous
        if (this.previous) {
            this.previous.next = this.next;
        }
        if (this.next) {
            this.next.previous = this.previous;
        }
        // Redirect to the next item
        var redirect = this.next;
        // Remove references
        this.next = hard ? null : redirect;
        this.previous = null;
        return redirect;
    };
    return TickerListener;
}());

/**
 * A Ticker class that runs an update loop that other objects listen to.
 *
 * This class is composed around listeners meant for execution on the next requested animation frame.
 * Animation frames are requested only when necessary, e.g. When the ticker is started and the emitter has listeners.
 *
 * @class
 * @memberof PIXI
 */
var Ticker = /** @class */ (function () {
    function Ticker() {
        var _this = this;
        /**
         * Whether or not this ticker should invoke the method
         * {@link PIXI.Ticker#start} automatically
         * when a listener is added.
         */
        this.autoStart = false;
        /**
         * Scalar time value from last frame to this frame.
         * This value is capped by setting {@link PIXI.Ticker#minFPS}
         * and is scaled with {@link PIXI.Ticker#speed}.
         * **Note:** The cap may be exceeded by scaling.
         */
        this.deltaTime = 1;
        /**
         * The last time {@link PIXI.Ticker#update} was invoked.
         * This value is also reset internally outside of invoking
         * update, but only when a new animation frame is requested.
         * If the platform supports DOMHighResTimeStamp,
         * this value will have a precision of 1 µs.
         */
        this.lastTime = -1;
        /**
         * Factor of current {@link PIXI.Ticker#deltaTime}.
         * @example
         * // Scales ticker.deltaTime to what would be
         * // the equivalent of approximately 120 FPS
         * ticker.speed = 2;
         */
        this.speed = 1;
        /**
         * Whether or not this ticker has been started.
         * `true` if {@link PIXI.Ticker#start} has been called.
         * `false` if {@link PIXI.Ticker#stop} has been called.
         * While `false`, this value may change to `true` in the
         * event of {@link PIXI.Ticker#autoStart} being `true`
         * and a listener is added.
         */
        this.started = false;
        /** Internal current frame request ID */
        this._requestId = null;
        /**
         * Internal value managed by minFPS property setter and getter.
         * This is the maximum allowed milliseconds between updates.
         */
        this._maxElapsedMS = 100;
        /**
         * Internal value managed by minFPS property setter and getter.
         * This is the maximum allowed milliseconds between updates.
         */
        this._minElapsedMS = 0;
        /** If enabled, deleting is disabled.*/
        this._protected = false;
        /**
         * The last time keyframe was executed.
         * Maintains a relatively fixed interval with the previous value.
         */
        this._lastFrame = -1;
        this._head = new TickerListener(null, null, Infinity);
        this.deltaMS = 1 / settings.TARGET_FPMS;
        this.elapsedMS = 1 / settings.TARGET_FPMS;
        this._tick = function (time) {
            _this._requestId = null;
            if (_this.started) {
                // Invoke listeners now
                _this.update(time);
                // Listener side effects may have modified ticker state.
                if (_this.started && _this._requestId === null && _this._head.next) {
                    _this._requestId = requestAnimationFrame(_this._tick);
                }
            }
        };
    }
    /**
     * Conditionally requests a new animation frame.
     * If a frame has not already been requested, and if the internal
     * emitter has listeners, a new frame is requested.
     *
     * @private
     */
    Ticker.prototype._requestIfNeeded = function () {
        if (this._requestId === null && this._head.next) {
            // ensure callbacks get correct delta
            this.lastTime = performance.now();
            this._lastFrame = this.lastTime;
            this._requestId = requestAnimationFrame(this._tick);
        }
    };
    /**
     * Conditionally cancels a pending animation frame.
     * @private
     */
    Ticker.prototype._cancelIfNeeded = function () {
        if (this._requestId !== null) {
            cancelAnimationFrame(this._requestId);
            this._requestId = null;
        }
    };
    /**
     * Conditionally requests a new animation frame.
     * If the ticker has been started it checks if a frame has not already
     * been requested, and if the internal emitter has listeners. If these
     * conditions are met, a new frame is requested. If the ticker has not
     * been started, but autoStart is `true`, then the ticker starts now,
     * and continues with the previous conditions to request a new frame.
     *
     * @private
     */
    Ticker.prototype._startIfPossible = function () {
        if (this.started) {
            this._requestIfNeeded();
        }
        else if (this.autoStart) {
            this.start();
        }
    };
    /**
     * Register a handler for tick events. Calls continuously unless
     * it is removed or the ticker is stopped.
     *
     * @param fn - The listener function to be added for updates
     * @param context - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns This instance of a ticker
     */
    Ticker.prototype.add = function (fn, context, priority) {
        if (priority === void 0) { priority = UPDATE_PRIORITY.NORMAL; }
        return this._addListener(new TickerListener(fn, context, priority));
    };
    /**
     * Add a handler for the tick event which is only execute once.
     *
     * @param fn - The listener function to be added for one update
     * @param context - The listener context
     * @param {number} [priority=PIXI.UPDATE_PRIORITY.NORMAL] - The priority for emitting
     * @returns This instance of a ticker
     */
    Ticker.prototype.addOnce = function (fn, context, priority) {
        if (priority === void 0) { priority = UPDATE_PRIORITY.NORMAL; }
        return this._addListener(new TickerListener(fn, context, priority, true));
    };
    /**
     * Internally adds the event handler so that it can be sorted by priority.
     * Priority allows certain handler (user, AnimatedSprite, Interaction) to be run
     * before the rendering.
     *
     * @private
     * @param listener - Current listener being added.
     * @returns This instance of a ticker
     */
    Ticker.prototype._addListener = function (listener) {
        // For attaching to head
        var current = this._head.next;
        var previous = this._head;
        // Add the first item
        if (!current) {
            listener.connect(previous);
        }
        else {
            // Go from highest to lowest priority
            while (current) {
                if (listener.priority > current.priority) {
                    listener.connect(previous);
                    break;
                }
                previous = current;
                current = current.next;
            }
            // Not yet connected
            if (!listener.previous) {
                listener.connect(previous);
            }
        }
        this._startIfPossible();
        return this;
    };
    /**
     * Removes any handlers matching the function and context parameters.
     * If no handlers are left after removing, then it cancels the animation frame.
     *
     * @param fn - The listener function to be removed
     * @param context - The listener context to be removed
     * @returns This instance of a ticker
     */
    Ticker.prototype.remove = function (fn, context) {
        var listener = this._head.next;
        while (listener) {
            // We found a match, lets remove it
            // no break to delete all possible matches
            // incase a listener was added 2+ times
            if (listener.match(fn, context)) {
                listener = listener.destroy();
            }
            else {
                listener = listener.next;
            }
        }
        if (!this._head.next) {
            this._cancelIfNeeded();
        }
        return this;
    };
    Object.defineProperty(Ticker.prototype, "count", {
        /**
         * The number of listeners on this ticker, calculated by walking through linked list
         *
         * @readonly
         * @member {number}
         */
        get: function () {
            if (!this._head) {
                return 0;
            }
            var count = 0;
            var current = this._head;
            while ((current = current.next)) {
                count++;
            }
            return count;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Starts the ticker. If the ticker has listeners
     * a new animation frame is requested at this point.
     */
    Ticker.prototype.start = function () {
        if (!this.started) {
            this.started = true;
            this._requestIfNeeded();
        }
    };
    /**
     * Stops the ticker. If the ticker has requested
     * an animation frame it is canceled at this point.
     */
    Ticker.prototype.stop = function () {
        if (this.started) {
            this.started = false;
            this._cancelIfNeeded();
        }
    };
    /**
     * Destroy the ticker and don't use after this. Calling
     * this method removes all references to internal events.
     */
    Ticker.prototype.destroy = function () {
        if (!this._protected) {
            this.stop();
            var listener = this._head.next;
            while (listener) {
                listener = listener.destroy(true);
            }
            this._head.destroy();
            this._head = null;
        }
    };
    /**
     * Triggers an update. An update entails setting the
     * current {@link PIXI.Ticker#elapsedMS},
     * the current {@link PIXI.Ticker#deltaTime},
     * invoking all listeners with current deltaTime,
     * and then finally setting {@link PIXI.Ticker#lastTime}
     * with the value of currentTime that was provided.
     * This method will be called automatically by animation
     * frame callbacks if the ticker instance has been started
     * and listeners are added.
     *
     * @param {number} [currentTime=performance.now()] - the current time of execution
     */
    Ticker.prototype.update = function (currentTime) {
        if (currentTime === void 0) { currentTime = performance.now(); }
        var elapsedMS;
        // If the difference in time is zero or negative, we ignore most of the work done here.
        // If there is no valid difference, then should be no reason to let anyone know about it.
        // A zero delta, is exactly that, nothing should update.
        //
        // The difference in time can be negative, and no this does not mean time traveling.
        // This can be the result of a race condition between when an animation frame is requested
        // on the current JavaScript engine event loop, and when the ticker's start method is invoked
        // (which invokes the internal _requestIfNeeded method). If a frame is requested before
        // _requestIfNeeded is invoked, then the callback for the animation frame the ticker requests,
        // can receive a time argument that can be less than the lastTime value that was set within
        // _requestIfNeeded. This difference is in microseconds, but this is enough to cause problems.
        //
        // This check covers this browser engine timing issue, as well as if consumers pass an invalid
        // currentTime value. This may happen if consumers opt-out of the autoStart, and update themselves.
        if (currentTime > this.lastTime) {
            // Save uncapped elapsedMS for measurement
            elapsedMS = this.elapsedMS = currentTime - this.lastTime;
            // cap the milliseconds elapsed used for deltaTime
            if (elapsedMS > this._maxElapsedMS) {
                elapsedMS = this._maxElapsedMS;
            }
            elapsedMS *= this.speed;
            // If not enough time has passed, exit the function.
            // Get ready for next frame by setting _lastFrame, but based on _minElapsedMS
            // adjustment to ensure a relatively stable interval.
            if (this._minElapsedMS) {
                var delta = currentTime - this._lastFrame | 0;
                if (delta < this._minElapsedMS) {
                    return;
                }
                this._lastFrame = currentTime - (delta % this._minElapsedMS);
            }
            this.deltaMS = elapsedMS;
            this.deltaTime = this.deltaMS * settings.TARGET_FPMS;
            // Cache a local reference, in-case ticker is destroyed
            // during the emit, we can still check for head.next
            var head = this._head;
            // Invoke listeners added to internal emitter
            var listener = head.next;
            while (listener) {
                listener = listener.emit(this.deltaTime);
            }
            if (!head.next) {
                this._cancelIfNeeded();
            }
        }
        else {
            this.deltaTime = this.deltaMS = this.elapsedMS = 0;
        }
        this.lastTime = currentTime;
    };
    Object.defineProperty(Ticker.prototype, "FPS", {
        /**
         * The frames per second at which this ticker is running.
         * The default is approximately 60 in most modern browsers.
         * **Note:** This does not factor in the value of
         * {@link PIXI.Ticker#speed}, which is specific
         * to scaling {@link PIXI.Ticker#deltaTime}.
         *
         * @member {number}
         * @readonly
         */
        get: function () {
            return 1000 / this.elapsedMS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ticker.prototype, "minFPS", {
        /**
         * Manages the maximum amount of milliseconds allowed to
         * elapse between invoking {@link PIXI.Ticker#update}.
         * This value is used to cap {@link PIXI.Ticker#deltaTime},
         * but does not effect the measured value of {@link PIXI.Ticker#FPS}.
         * When setting this property it is clamped to a value between
         * `0` and `PIXI.settings.TARGET_FPMS * 1000`.
         *
         * @member {number}
         * @default 10
         */
        get: function () {
            return 1000 / this._maxElapsedMS;
        },
        set: function (fps) {
            // Minimum must be below the maxFPS
            var minFPS = Math.min(this.maxFPS, fps);
            // Must be at least 0, but below 1 / settings.TARGET_FPMS
            var minFPMS = Math.min(Math.max(0, minFPS) / 1000, settings.TARGET_FPMS);
            this._maxElapsedMS = 1 / minFPMS;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ticker.prototype, "maxFPS", {
        /**
         * Manages the minimum amount of milliseconds required to
         * elapse between invoking {@link PIXI.Ticker#update}.
         * This will effect the measured value of {@link PIXI.Ticker#FPS}.
         * If it is set to `0`, then there is no limit; PixiJS will render as many frames as it can.
         * Otherwise it will be at least `minFPS`
         *
         * @member {number}
         * @default 0
         */
        get: function () {
            if (this._minElapsedMS) {
                return Math.round(1000 / this._minElapsedMS);
            }
            return 0;
        },
        set: function (fps) {
            if (fps === 0) {
                this._minElapsedMS = 0;
            }
            else {
                // Max must be at least the minFPS
                var maxFPS = Math.max(this.minFPS, fps);
                this._minElapsedMS = 1 / (maxFPS / 1000);
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ticker, "shared", {
        /**
         * The shared ticker instance used by {@link PIXI.AnimatedSprite} and by
         * {@link PIXI.VideoResource} to update animation frames / video textures.
         *
         * It may also be used by {@link PIXI.Application} if created with the `sharedTicker` option property set to true.
         *
         * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
         * Please follow the examples for usage, including how to opt-out of auto-starting the shared ticker.
         *
         * @example
         * let ticker = PIXI.Ticker.shared;
         * // Set this to prevent starting this ticker when listeners are added.
         * // By default this is true only for the PIXI.Ticker.shared instance.
         * ticker.autoStart = false;
         * // FYI, call this to ensure the ticker is stopped. It should be stopped
         * // if you have not attempted to render anything yet.
         * ticker.stop();
         * // Call this when you are ready for a running shared ticker.
         * ticker.start();
         *
         * @example
         * // You may use the shared ticker to render...
         * let renderer = PIXI.autoDetectRenderer();
         * let stage = new PIXI.Container();
         * document.body.appendChild(renderer.view);
         * ticker.add(function (time) {
         *     renderer.render(stage);
         * });
         *
         * @example
         * // Or you can just update it manually.
         * ticker.autoStart = false;
         * ticker.stop();
         * function animate(time) {
         *     ticker.update(time);
         *     renderer.render(stage);
         *     requestAnimationFrame(animate);
         * }
         * animate(performance.now());
         *
         * @member {PIXI.Ticker}
         * @static
         */
        get: function () {
            if (!Ticker._shared) {
                var shared = Ticker._shared = new Ticker();
                shared.autoStart = true;
                shared._protected = true;
            }
            return Ticker._shared;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Ticker, "system", {
        /**
         * The system ticker instance used by {@link PIXI.InteractionManager} and by
         * {@link PIXI.BasePrepare} for core timing functionality that shouldn't usually need to be paused,
         * unlike the `shared` ticker which drives visual animations and rendering which may want to be paused.
         *
         * The property {@link PIXI.Ticker#autoStart} is set to `true` for this instance.
         *
         * @member {PIXI.Ticker}
         * @static
         */
        get: function () {
            if (!Ticker._system) {
                var system = Ticker._system = new Ticker();
                system.autoStart = true;
                system._protected = true;
            }
            return Ticker._system;
        },
        enumerable: false,
        configurable: true
    });
    return Ticker;
}());

/*!
 * @pixi/interaction - v6.1.3
 * Compiled Mon, 13 Sep 2021 15:29:31 UTC
 *
 * @pixi/interaction is licensed under the MIT License.
 * http://www.opensource.org/licenses/mit-license
 */

/**
 * Holds all information related to an Interaction event
 *
 * @class
 * @memberof PIXI
 */
var InteractionData = /** @class */ (function () {
    function InteractionData() {
        this.pressure = 0;
        this.rotationAngle = 0;
        this.twist = 0;
        this.tangentialPressure = 0;
        /**
         * This point stores the global coords of where the touch/mouse event happened
         *
         * @member {PIXI.Point}
         */
        this.global = new Point();
        /**
         * The target Sprite that was interacted with
         *
         * @member {PIXI.Sprite}
         */
        this.target = null;
        /**
         * When passed to an event handler, this will be the original DOM Event that was captured
         *
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent
         * @see https://developer.mozilla.org/en-US/docs/Web/API/TouchEvent
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent
         * @member {MouseEvent|TouchEvent|PointerEvent}
         */
        this.originalEvent = null;
        /**
         * Unique identifier for this interaction
         *
         * @member {number}
         */
        this.identifier = null;
        /**
         * Indicates whether or not the pointer device that created the event is the primary pointer.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/isPrimary
         * @type {Boolean}
         */
        this.isPrimary = false;
        /**
         * Indicates which button was pressed on the mouse or pointer device to trigger the event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
         * @type {number}
         */
        this.button = 0;
        /**
         * Indicates which buttons are pressed on the mouse or pointer device when the event is triggered.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/buttons
         * @type {number}
         */
        this.buttons = 0;
        /**
         * The width of the pointer's contact along the x-axis, measured in CSS pixels.
         * radiusX of TouchEvents will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/width
         * @type {number}
         */
        this.width = 0;
        /**
         * The height of the pointer's contact along the y-axis, measured in CSS pixels.
         * radiusY of TouchEvents will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/height
         * @type {number}
         */
        this.height = 0;
        /**
         * The angle, in degrees, between the pointer device and the screen.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltX
         * @type {number}
         */
        this.tiltX = 0;
        /**
         * The angle, in degrees, between the pointer device and the screen.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/tiltY
         * @type {number}
         */
        this.tiltY = 0;
        /**
         * The type of pointer that triggered the event.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerType
         * @type {string}
         */
        this.pointerType = null;
        /**
         * Pressure applied by the pointing device during the event. A Touch's force property
         * will be represented by this value.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pressure
         * @type {number}
         */
        this.pressure = 0;
        /**
         * From TouchEvents (not PointerEvents triggered by touches), the rotationAngle of the Touch.
         * @see https://developer.mozilla.org/en-US/docs/Web/API/Touch/rotationAngle
         * @type {number}
         */
        this.rotationAngle = 0;
        /**
         * Twist of a stylus pointer.
         * @see https://w3c.github.io/pointerevents/#pointerevent-interface
         * @type {number}
         */
        this.twist = 0;
        /**
         * Barrel pressure on a stylus pointer.
         * @see https://w3c.github.io/pointerevents/#pointerevent-interface
         * @type {number}
         */
        this.tangentialPressure = 0;
    }
    Object.defineProperty(InteractionData.prototype, "pointerId", {
        /**
         * The unique identifier of the pointer. It will be the same as `identifier`.
         * @readonly
         * @member {number}
         * @see https://developer.mozilla.org/en-US/docs/Web/API/PointerEvent/pointerId
         */
        get: function () {
            return this.identifier;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * This will return the local coordinates of the specified displayObject for this InteractionData
     *
     * @param {PIXI.DisplayObject} displayObject - The DisplayObject that you would like the local
     *  coords off
     * @param {PIXI.Point} [point] - A Point object in which to store the value, optional (otherwise
     *  will create a new point)
     * @param {PIXI.Point} [globalPos] - A Point object containing your custom global coords, optional
     *  (otherwise will use the current global coords)
     * @return {PIXI.Point} A point containing the coordinates of the InteractionData position relative
     *  to the DisplayObject
     */
    InteractionData.prototype.getLocalPosition = function (displayObject, point, globalPos) {
        return displayObject.worldTransform.applyInverse(globalPos || this.global, point);
    };
    /**
     * Copies properties from normalized event data.
     *
     * @param {Touch|MouseEvent|PointerEvent} event - The normalized event data
     */
    InteractionData.prototype.copyEvent = function (event) {
        // isPrimary should only change on touchstart/pointerdown, so we don't want to overwrite
        // it with "false" on later events when our shim for it on touch events might not be
        // accurate
        if ('isPrimary' in event && event.isPrimary) {
            this.isPrimary = true;
        }
        this.button = 'button' in event && event.button;
        // event.buttons is not available in all browsers (ie. Safari), but it does have a non-standard
        // event.which property instead, which conveys the same information.
        var buttons = 'buttons' in event && event.buttons;
        this.buttons = Number.isInteger(buttons) ? buttons : 'which' in event && event.which;
        this.width = 'width' in event && event.width;
        this.height = 'height' in event && event.height;
        this.tiltX = 'tiltX' in event && event.tiltX;
        this.tiltY = 'tiltY' in event && event.tiltY;
        this.pointerType = 'pointerType' in event && event.pointerType;
        this.pressure = 'pressure' in event && event.pressure;
        this.rotationAngle = 'rotationAngle' in event && event.rotationAngle;
        this.twist = ('twist' in event && event.twist) || 0;
        this.tangentialPressure = ('tangentialPressure' in event && event.tangentialPressure) || 0;
    };
    /**
     * Resets the data for pooling.
     */
    InteractionData.prototype.reset = function () {
        // isPrimary is the only property that we really need to reset - everything else is
        // guaranteed to be overwritten
        this.isPrimary = false;
    };
    return InteractionData;
}());

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */
/* global Reflect, Promise */

var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) { if (b.hasOwnProperty(p)) { d[p] = b[p]; } } };
    return extendStatics(d, b);
};

function __extends(d, b) {
    extendStatics(d, b);
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

/**
 * Event class that mimics native DOM events.
 *
 * @class
 * @memberof PIXI
 */
var InteractionEvent = /** @class */ (function () {
    function InteractionEvent() {
        /**
         * Whether this event will continue propagating in the tree.
         *
         * Remaining events for the {@link stopsPropagatingAt} object
         * will still be dispatched.
         *
         * @member {boolean}
         */
        this.stopped = false;
        /**
         * At which object this event stops propagating.
         *
         * @private
         * @member {PIXI.DisplayObject}
         */
        this.stopsPropagatingAt = null;
        /**
         * Whether we already reached the element we want to
         * stop propagating at. This is important for delayed events,
         * where we start over deeper in the tree again.
         *
         * @private
         * @member {boolean}
         */
        this.stopPropagationHint = false;
        /**
         * The object which caused this event to be dispatched.
         * For listener callback see {@link PIXI.InteractionEvent.currentTarget}.
         *
         * @member {PIXI.DisplayObject}
         */
        this.target = null;
        /**
         * The object whose event listener’s callback is currently being invoked.
         *
         * @member {PIXI.DisplayObject}
         */
        this.currentTarget = null;
        /**
         * Type of the event
         *
         * @member {string}
         */
        this.type = null;
        /**
         * InteractionData related to this event
         *
         * @member {PIXI.InteractionData}
         */
        this.data = null;
    }
    /**
     * Prevents event from reaching any objects other than the current object.
     *
     */
    InteractionEvent.prototype.stopPropagation = function () {
        this.stopped = true;
        this.stopPropagationHint = true;
        this.stopsPropagatingAt = this.currentTarget;
    };
    /**
     * Resets the event.
     */
    InteractionEvent.prototype.reset = function () {
        this.stopped = false;
        this.stopsPropagatingAt = null;
        this.stopPropagationHint = false;
        this.currentTarget = null;
        this.target = null;
    };
    return InteractionEvent;
}());

/**
 * DisplayObjects with the {@link PIXI.interactiveTarget} mixin use this class to track interactions
 *
 * @class
 * @private
 * @memberof PIXI
 */
var InteractionTrackingData = /** @class */ (function () {
    /**
     * @param {number} pointerId - Unique pointer id of the event
     * @private
     */
    function InteractionTrackingData(pointerId) {
        this._pointerId = pointerId;
        this._flags = InteractionTrackingData.FLAGS.NONE;
    }
    /**
     *
     * @private
     * @param {number} flag - The interaction flag to set
     * @param {boolean} yn - Should the flag be set or unset
     */
    InteractionTrackingData.prototype._doSet = function (flag, yn) {
        if (yn) {
            this._flags = this._flags | flag;
        }
        else {
            this._flags = this._flags & (~flag);
        }
    };
    Object.defineProperty(InteractionTrackingData.prototype, "pointerId", {
        /**
         * Unique pointer id of the event
         *
         * @readonly
         * @private
         * @member {number}
         */
        get: function () {
            return this._pointerId;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "flags", {
        /**
         * State of the tracking data, expressed as bit flags
         *
         * @private
         * @member {number}
         */
        get: function () {
            return this._flags;
        },
        set: function (flags) {
            this._flags = flags;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "none", {
        /**
         * Is the tracked event inactive (not over or down)?
         *
         * @private
         * @member {number}
         */
        get: function () {
            return this._flags === InteractionTrackingData.FLAGS.NONE;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "over", {
        /**
         * Is the tracked event over the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.OVER) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.OVER, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "rightDown", {
        /**
         * Did the right mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.RIGHT_DOWN) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.RIGHT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionTrackingData.prototype, "leftDown", {
        /**
         * Did the left mouse button come down in the DisplayObject?
         *
         * @private
         * @member {boolean}
         */
        get: function () {
            return (this._flags & InteractionTrackingData.FLAGS.LEFT_DOWN) !== 0;
        },
        set: function (yn) {
            this._doSet(InteractionTrackingData.FLAGS.LEFT_DOWN, yn);
        },
        enumerable: false,
        configurable: true
    });
    InteractionTrackingData.FLAGS = Object.freeze({
        NONE: 0,
        OVER: 1 << 0,
        LEFT_DOWN: 1 << 1,
        RIGHT_DOWN: 1 << 2,
    });
    return InteractionTrackingData;
}());

/**
 * Strategy how to search through stage tree for interactive objects
 *
 * @private
 * @class
 * @memberof PIXI
 */
var TreeSearch = /** @class */ (function () {
    function TreeSearch() {
        this._tempPoint = new Point();
    }
    /**
     * Recursive implementation for findHit
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @param {boolean} [interactive] - Whether the displayObject is interactive
     * @return {boolean} returns true if the displayObject hit the point
     */
    TreeSearch.prototype.recursiveFindHit = function (interactionEvent, displayObject, func, hitTest, interactive) {
        if (!displayObject || !displayObject.visible) {
            return false;
        }
        var point = interactionEvent.data.global;
        // Took a little while to rework this function correctly! But now it is done and nice and optimized! ^_^
        //
        // This function will now loop through all objects and then only hit test the objects it HAS
        // to, not all of them. MUCH faster..
        // An object will be hit test if the following is true:
        //
        // 1: It is interactive.
        // 2: It belongs to a parent that is interactive AND one of the parents children have not already been hit.
        //
        // As another little optimization once an interactive object has been hit we can carry on
        // through the scenegraph, but we know that there will be no more hits! So we can avoid extra hit tests
        // A final optimization is that an object is not hit test directly if a child has already been hit.
        interactive = displayObject.interactive || interactive;
        var hit = false;
        var interactiveParent = interactive;
        // Flag here can set to false if the event is outside the parents hitArea or mask
        var hitTestChildren = true;
        // If there is a hitArea, no need to test against anything else if the pointer is not within the hitArea
        // There is also no longer a need to hitTest children.
        if (displayObject.hitArea) {
            if (hitTest) {
                displayObject.worldTransform.applyInverse(point, this._tempPoint);
                if (!displayObject.hitArea.contains(this._tempPoint.x, this._tempPoint.y)) {
                    hitTest = false;
                    hitTestChildren = false;
                }
                else {
                    hit = true;
                }
            }
            interactiveParent = false;
        }
        // If there is a mask, no need to hitTest against anything else if the pointer is not within the mask.
        // We still want to hitTestChildren, however, to ensure a mouseout can still be generated.
        // https://github.com/pixijs/pixi.js/issues/5135
        else if (displayObject._mask) {
            if (hitTest) {
                if (!(displayObject._mask.containsPoint && displayObject._mask.containsPoint(point))) {
                    hitTest = false;
                }
            }
        }
        // ** FREE TIP **! If an object is not interactive or has no buttons in it
        // (such as a game scene!) set interactiveChildren to false for that displayObject.
        // This will allow PixiJS to completely ignore and bypass checking the displayObjects children.
        if (hitTestChildren && displayObject.interactiveChildren && displayObject.children) {
            var children = displayObject.children;
            for (var i = children.length - 1; i >= 0; i--) {
                var child = children[i];
                // time to get recursive.. if this function will return if something is hit..
                var childHit = this.recursiveFindHit(interactionEvent, child, func, hitTest, interactiveParent);
                if (childHit) {
                    // its a good idea to check if a child has lost its parent.
                    // this means it has been removed whilst looping so its best
                    if (!child.parent) {
                        continue;
                    }
                    // we no longer need to hit test any more objects in this container as we we
                    // now know the parent has been hit
                    interactiveParent = false;
                    // If the child is interactive , that means that the object hit was actually
                    // interactive and not just the child of an interactive object.
                    // This means we no longer need to hit test anything else. We still need to run
                    // through all objects, but we don't need to perform any hit tests.
                    if (childHit) {
                        if (interactionEvent.target) {
                            hitTest = false;
                        }
                        hit = true;
                    }
                }
            }
        }
        // no point running this if the item is not interactive or does not have an interactive parent.
        if (interactive) {
            // if we are hit testing (as in we have no hit any objects yet)
            // We also don't need to worry about hit testing if once of the displayObjects children
            // has already been hit - but only if it was interactive, otherwise we need to keep
            // looking for an interactive child, just in case we hit one
            if (hitTest && !interactionEvent.target) {
                // already tested against hitArea if it is defined
                if (!displayObject.hitArea && displayObject.containsPoint) {
                    if (displayObject.containsPoint(point)) {
                        hit = true;
                    }
                }
            }
            if (displayObject.interactive) {
                if (hit && !interactionEvent.target) {
                    interactionEvent.target = displayObject;
                }
                if (func) {
                    func(interactionEvent, displayObject, !!hit);
                }
            }
        }
        return hit;
    };
    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - this indicates if the objects inside should be hit test against the point
     * @return {boolean} returns true if the displayObject hit the point
     */
    TreeSearch.prototype.findHit = function (interactionEvent, displayObject, func, hitTest) {
        this.recursiveFindHit(interactionEvent, displayObject, func, hitTest, false);
    };
    return TreeSearch;
}());

/**
 * Interface for classes that represent a hit area.
 *
 * It is implemented by the following classes:
 * - {@link PIXI.Circle}
 * - {@link PIXI.Ellipse}
 * - {@link PIXI.Polygon}
 * - {@link PIXI.RoundedRectangle}
 *
 * @interface IHitArea
 * @memberof PIXI
 */
/**
 * Checks whether the x and y coordinates given are contained within this area
 *
 * @method
 * @name contains
 * @memberof PIXI.IHitArea#
 * @param {number} x - The X coordinate of the point to test
 * @param {number} y - The Y coordinate of the point to test
 * @return {boolean} Whether the x/y coordinates are within this area
 */
/**
 * Default property values of interactive objects
 * Used by {@link PIXI.InteractionManager} to automatically give all DisplayObjects these properties
 *
 * @private
 * @name interactiveTarget
 * @type {Object}
 * @memberof PIXI
 * @example
 *      function MyObject() {}
 *
 *      Object.assign(
 *          DisplayObject.prototype,
 *          PIXI.interactiveTarget
 *      );
 */
var interactiveTarget = {
    interactive: false,
    interactiveChildren: true,
    hitArea: null,
    /**
     * If enabled, the mouse cursor use the pointer behavior when hovered over the displayObject if it is interactive
     * Setting this changes the 'cursor' property to `'pointer'`.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.buttonMode = true;
     * @member {boolean}
     * @memberof PIXI.DisplayObject#
     */
    get buttonMode() {
        return this.cursor === 'pointer';
    },
    set buttonMode(value) {
        if (value) {
            this.cursor = 'pointer';
        }
        else if (this.cursor === 'pointer') {
            this.cursor = null;
        }
    },
    /**
     * This defines what cursor mode is used when the mouse cursor
     * is hovered over the displayObject.
     *
     * @example
     * const sprite = new PIXI.Sprite(texture);
     * sprite.interactive = true;
     * sprite.cursor = 'wait';
     * @see https://developer.mozilla.org/en/docs/Web/CSS/cursor
     *
     * @member {string}
     * @memberof PIXI.DisplayObject#
     */
    cursor: null,
    /**
     * Internal set of all active pointers, by identifier
     *
     * @member {Map<number, InteractionTrackingData>}
     * @memberof PIXI.DisplayObject#
     * @private
     */
    get trackedPointers() {
        if (this._trackedPointers === undefined)
            { this._trackedPointers = {}; }
        return this._trackedPointers;
    },
    /**
     * Map of all tracked pointers, by identifier. Use trackedPointers to access.
     *
     * @private
     * @type {Map<number, InteractionTrackingData>}
     */
    _trackedPointers: undefined,
};

// Mix interactiveTarget into DisplayObject.prototype
DisplayObject.mixin(interactiveTarget);
var MOUSE_POINTER_ID = 1;
// helpers for hitTest() - only used inside hitTest()
var hitTestEvent = {
    target: null,
    data: {
        global: null,
    },
};
/**
 * The interaction manager deals with mouse, touch and pointer events.
 *
 * Any DisplayObject can be interactive if its `interactive` property is set to true.
 *
 * This manager also supports multitouch.
 *
 * An instance of this class is automatically created by default, and can be found at `renderer.plugins.interaction`
 *
 * @class
 * @extends PIXI.utils.EventEmitter
 * @memberof PIXI
 */
var InteractionManager = /** @class */ (function (_super) {
    __extends(InteractionManager, _super);
    /**
     * @param {PIXI.CanvasRenderer|PIXI.Renderer} renderer - A reference to the current renderer
     * @param {object} [options] - The options for the manager.
     * @param {boolean} [options.autoPreventDefault=true] - Should the manager automatically prevent default browser actions.
     * @param {number} [options.interactionFrequency=10] - Maximum frequency (ms) at pointer over/out states will be checked.
     * @param {number} [options.useSystemTicker=true] - Whether to add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
     */
    function InteractionManager(renderer, options) {
        var _this = _super.call(this) || this;
        options = options || {};
        /**
         * The renderer this interaction manager works for.
         *
         * @member {PIXI.AbstractRenderer}
         */
        _this.renderer = renderer;
        /**
         * Should default browser actions automatically be prevented.
         * Does not apply to pointer events for backwards compatibility
         * preventDefault on pointer events stops mouse events from firing
         * Thus, for every pointer event, there will always be either a mouse of touch event alongside it.
         *
         * @member {boolean}
         * @default true
         */
        _this.autoPreventDefault = options.autoPreventDefault !== undefined ? options.autoPreventDefault : true;
        /**
         * Maximum frequency in milliseconds at which pointer over/out states will be checked by {@link tickerUpdate}.
         *
         * @member {number}
         * @default 10
         */
        _this.interactionFrequency = options.interactionFrequency || 10;
        /**
         * The mouse data
         *
         * @member {PIXI.InteractionData}
         */
        _this.mouse = new InteractionData();
        _this.mouse.identifier = MOUSE_POINTER_ID;
        // setting the mouse to start off far off screen will mean that mouse over does
        //  not get called before we even move the mouse.
        _this.mouse.global.set(-999999);
        /**
         * Actively tracked InteractionData
         *
         * @private
         * @member {Object.<number,PIXI.InteractionData>}
         */
        _this.activeInteractionData = {};
        _this.activeInteractionData[MOUSE_POINTER_ID] = _this.mouse;
        /**
         * Pool of unused InteractionData
         *
         * @private
         * @member {PIXI.InteractionData[]}
         */
        _this.interactionDataPool = [];
        /**
         * An event data object to handle all the event tracking/dispatching
         *
         * @member {object}
         */
        _this.eventData = new InteractionEvent();
        /**
         * The DOM element to bind to.
         *
         * @protected
         * @member {HTMLElement}
         */
        _this.interactionDOMElement = null;
        /**
         * This property determines if mousemove and touchmove events are fired only when the cursor
         * is over the object.
         * Setting to true will make things work more in line with how the DOM version works.
         * Setting to false can make things easier for things like dragging
         * It is currently set to false as this is how PixiJS used to work. This will be set to true in
         * future versions of pixi.
         *
         * @member {boolean}
         * @default false
         */
        _this.moveWhenInside = false;
        /**
         * Have events been attached to the dom element?
         *
         * @protected
         * @member {boolean}
         */
        _this.eventsAdded = false;
        /**
         * Has the system ticker been added?
         *
         * @protected
         * @member {boolean}
         */
        _this.tickerAdded = false;
        /**
         * Is the mouse hovering over the renderer? If working in worker mouse considered to be over renderer by default.
         *
         * @protected
         * @member {boolean}
         */
        _this.mouseOverRenderer = !('PointerEvent' in self);
        /**
         * Does the device support touch events
         * https://www.w3.org/TR/touch-events/
         *
         * @readonly
         * @member {boolean}
         */
        _this.supportsTouchEvents = 'ontouchstart' in self;
        /**
         * Does the device support pointer events
         * https://www.w3.org/Submission/pointer-events/
         *
         * @readonly
         * @member {boolean}
         */
        _this.supportsPointerEvents = !!self.PointerEvent;
        // this will make it so that you don't have to call bind all the time
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerUp = _this.onPointerUp.bind(_this);
        _this.processPointerUp = _this.processPointerUp.bind(_this);
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerCancel = _this.onPointerCancel.bind(_this);
        _this.processPointerCancel = _this.processPointerCancel.bind(_this);
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerDown = _this.onPointerDown.bind(_this);
        _this.processPointerDown = _this.processPointerDown.bind(_this);
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerMove = _this.onPointerMove.bind(_this);
        _this.processPointerMove = _this.processPointerMove.bind(_this);
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerOut = _this.onPointerOut.bind(_this);
        _this.processPointerOverOut = _this.processPointerOverOut.bind(_this);
        /**
         * @private
         * @member {Function}
         */
        _this.onPointerOver = _this.onPointerOver.bind(_this);
        /**
         * Dictionary of how different cursor modes are handled. Strings are handled as CSS cursor
         * values, objects are handled as dictionaries of CSS values for interactionDOMElement,
         * and functions are called instead of changing the CSS.
         * Default CSS cursor values are provided for 'default' and 'pointer' modes.
         * @member {Object.<string, Object>}
         */
        _this.cursorStyles = {
            default: 'inherit',
            pointer: 'pointer',
        };
        /**
         * The mode of the cursor that is being used.
         * The value of this is a key from the cursorStyles dictionary.
         *
         * @member {string}
         */
        _this.currentCursorMode = null;
        /**
         * Internal cached let.
         *
         * @private
         * @member {string}
         */
        _this.cursor = null;
        /**
         * The current resolution / device pixel ratio.
         *
         * @member {number}
         * @default 1
         */
        _this.resolution = 1;
        /**
         * Delayed pointer events. Used to guarantee correct ordering of over/out events.
         *
         * @private
         * @member {Array}
         */
        _this.delayedEvents = [];
        /**
         * TreeSearch component that is used to hitTest stage tree
         *
         * @private
         * @member {PIXI.TreeSearch}
         */
        _this.search = new TreeSearch();
        /**
         * Used as a last rendered object in case renderer doesnt have _lastObjectRendered
         * @member {DisplayObject}
         * @private
         */
        _this._tempDisplayObject = new TemporaryDisplayObject();
        /**
         * An options object specifies characteristics about the event listener.
         * @private
         * @readonly
         * @member {Object.<string, boolean>}
         */
        _this._eventListenerOptions = { capture: true, passive: false };
        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display
         * object.
         *
         * @event PIXI.InteractionManager#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object.
         *
         * @event PIXI.InteractionManager#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object.
         *
         * @event PIXI.InteractionManager#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object.
         *
         * @event PIXI.InteractionManager#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object.
         *
         * @event PIXI.InteractionManager#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object.
         *
         * @event PIXI.InteractionManager#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.InteractionManager#event:mousedown}.
         *
         * @event PIXI.InteractionManager#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.InteractionManager#event:rightdown}.
         *
         * @event PIXI.InteractionManager#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object
         *
         * @event PIXI.InteractionManager#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object
         *
         * @event PIXI.InteractionManager#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object
         *
         * @event PIXI.InteractionManager#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed on the display object.
         *
         * @event PIXI.InteractionManager#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released over the display object.
         * Not always fired when some buttons are held down while others are released. In those cases,
         * use [mousedown]{@link PIXI.InteractionManager#event:mousedown} and
         * [mouseup]{@link PIXI.InteractionManager#event:mouseup} instead.
         *
         * @event PIXI.InteractionManager#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a pointer event
         *
         * @event PIXI.InteractionManager#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed and released on the display object.
         *
         * @event PIXI.InteractionManager#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.InteractionManager#event:pointerdown}.
         *
         * @event PIXI.InteractionManager#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved while over the display object
         *
         * @event PIXI.InteractionManager#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved onto the display object
         *
         * @event PIXI.InteractionManager#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved off the display object
         *
         * @event PIXI.InteractionManager#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed on the display object.
         *
         * @event PIXI.InteractionManager#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed from the display object.
         *
         * @event PIXI.InteractionManager#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a touch
         *
         * @event PIXI.InteractionManager#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed and removed from the display object.
         *
         * @event PIXI.InteractionManager#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.InteractionManager#event:touchstart}.
         *
         * @event PIXI.InteractionManager#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is moved along the display object.
         *
         * @event PIXI.InteractionManager#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed on the display.
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousedown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is released over the display
         * object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * over the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is pressed and released on
         * the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#click
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is pressed
         * and released on the display object. DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightclick
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button (usually a mouse left-button) is released outside the
         * display object that initially registered a
         * [mousedown]{@link PIXI.DisplayObject#event:mousedown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device secondary button (usually a mouse right-button) is released
         * outside the display object that initially registered a
         * [rightdown]{@link PIXI.DisplayObject#event:rightdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#rightupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mousemove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device (usually a mouse) is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#mouseout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerdown
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerup
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a pointer event.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointercancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is pressed and released on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointertap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device button is released outside the display object that initially
         * registered a [pointerdown]{@link PIXI.DisplayObject#event:pointerdown}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerupoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved while over the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointermove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved onto the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerover
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a pointer device is moved off the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#pointerout
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed on the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchstart
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchend
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when the operating system cancels a touch.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchcancel
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is placed and removed from the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#tap
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is removed outside of the display object that initially
         * registered a [touchstart]{@link PIXI.DisplayObject#event:touchstart}.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchendoutside
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        /**
         * Fired when a touch point is moved along the display object.
         * DisplayObject's `interactive` property must be set to `true` to fire event.
         *
         * This comes from the @pixi/interaction package.
         *
         * @event PIXI.DisplayObject#touchmove
         * @param {PIXI.InteractionEvent} event - Interaction event
         */
        _this._useSystemTicker = options.useSystemTicker !== undefined ? options.useSystemTicker : true;
        _this.setTargetElement(_this.renderer.view, _this.renderer.resolution);
        return _this;
    }
    Object.defineProperty(InteractionManager.prototype, "useSystemTicker", {
        /**
         * Should the InteractionManager automatically add {@link tickerUpdate} to {@link PIXI.Ticker.system}.
         *
         * @member {boolean}
         * @default true
         */
        get: function () {
            return this._useSystemTicker;
        },
        set: function (useSystemTicker) {
            this._useSystemTicker = useSystemTicker;
            if (useSystemTicker) {
                this.addTickerListener();
            }
            else {
                this.removeTickerListener();
            }
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(InteractionManager.prototype, "lastObjectRendered", {
        /**
         * Last rendered object or temp object
         * @readonly
         * @protected
         * @member {PIXI.DisplayObject}
         */
        get: function () {
            return this.renderer._lastObjectRendered || this._tempDisplayObject;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Hit tests a point against the display tree, returning the first interactive object that is hit.
     *
     * @param {PIXI.Point} globalPoint - A point to hit test with, in global space.
     * @param {PIXI.Container} [root] - The root display object to start from. If omitted, defaults
     * to the last rendered root of the associated renderer.
     * @return {PIXI.DisplayObject} The hit display object, if any.
     */
    InteractionManager.prototype.hitTest = function (globalPoint, root) {
        // clear the target for our hit test
        hitTestEvent.target = null;
        // assign the global point
        hitTestEvent.data.global = globalPoint;
        // ensure safety of the root
        if (!root) {
            root = this.lastObjectRendered;
        }
        // run the hit test
        this.processInteractive(hitTestEvent, root, null, true);
        // return our found object - it'll be null if we didn't hit anything
        return hitTestEvent.target;
    };
    /**
     * Sets the DOM element which will receive mouse/touch events. This is useful for when you have
     * other DOM elements on top of the renderers Canvas element. With this you'll be bale to delegate
     * another DOM element to receive those events.
     *
     * @param {HTMLElement} element - the DOM element which will receive mouse and touch events.
     * @param {number} [resolution=1] - The resolution / device pixel ratio of the new element (relative to the canvas).
     */
    InteractionManager.prototype.setTargetElement = function (element, resolution) {
        if (resolution === void 0) { resolution = 1; }
        this.removeTickerListener();
        this.removeEvents();
        this.interactionDOMElement = element;
        this.resolution = resolution;
        this.addEvents();
        this.addTickerListener();
    };
    /**
     * Add the ticker listener
     *
     * @private
     */
    InteractionManager.prototype.addTickerListener = function () {
        if (this.tickerAdded || !this.interactionDOMElement || !this._useSystemTicker) {
            return;
        }
        Ticker.system.add(this.tickerUpdate, this, UPDATE_PRIORITY.INTERACTION);
        this.tickerAdded = true;
    };
    /**
     * Remove the ticker listener
     *
     * @private
     */
    InteractionManager.prototype.removeTickerListener = function () {
        if (!this.tickerAdded) {
            return;
        }
        Ticker.system.remove(this.tickerUpdate, this);
        this.tickerAdded = false;
    };
    /**
     * Registers all the DOM events
     *
     * @private
     */
    InteractionManager.prototype.addEvents = function () {
        if (this.eventsAdded || !this.interactionDOMElement) {
            return;
        }
        var style = this.interactionDOMElement.style;
        if (self.navigator.msPointerEnabled) {
            style.msContentZooming = 'none';
            style.msTouchAction = 'none';
        }
        else if (this.supportsPointerEvents) {
            style.touchAction = 'none';
        }
        /*
         * These events are added first, so that if pointer events are normalized, they are fired
         * in the same order as non-normalized events. ie. pointer event 1st, mouse / touch 2nd
         */
        if (this.supportsPointerEvents) {
            self.document.addEventListener('pointermove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('pointerdown', this.onPointerDown, this._eventListenerOptions);
            // pointerout is fired in addition to pointerup (for touch events) and pointercancel
            // we already handle those, so for the purposes of what we do in onPointerOut, we only
            // care about the pointerleave event
            this.interactionDOMElement.addEventListener('pointerleave', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('pointerover', this.onPointerOver, this._eventListenerOptions);
            self.addEventListener('pointercancel', this.onPointerCancel, this._eventListenerOptions);
            self.addEventListener('pointerup', this.onPointerUp, this._eventListenerOptions);
        }
        else {
            self.document.addEventListener('mousemove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mousedown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mouseout', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('mouseover', this.onPointerOver, this._eventListenerOptions);
            self.addEventListener('mouseup', this.onPointerUp, this._eventListenerOptions);
        }
        // always look directly for touch events so that we can provide original data
        // In a future version we should change this to being just a fallback and rely solely on
        // PointerEvents whenever available
        if (this.supportsTouchEvents) {
            this.interactionDOMElement.addEventListener('touchstart', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchcancel', this.onPointerCancel, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchend', this.onPointerUp, this._eventListenerOptions);
            this.interactionDOMElement.addEventListener('touchmove', this.onPointerMove, this._eventListenerOptions);
        }
        this.eventsAdded = true;
    };
    /**
     * Removes all the DOM events that were previously registered
     *
     * @private
     */
    InteractionManager.prototype.removeEvents = function () {
        if (!this.eventsAdded || !this.interactionDOMElement) {
            return;
        }
        var style = this.interactionDOMElement.style;
        if (self.navigator.msPointerEnabled) {
            style.msContentZooming = '';
            style.msTouchAction = '';
        }
        else if (this.supportsPointerEvents) {
            style.touchAction = '';
        }
        if (this.supportsPointerEvents) {
            self.document.removeEventListener('pointermove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerdown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerleave', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('pointerover', this.onPointerOver, this._eventListenerOptions);
            self.removeEventListener('pointercancel', this.onPointerCancel, this._eventListenerOptions);
            self.removeEventListener('pointerup', this.onPointerUp, this._eventListenerOptions);
        }
        else {
            self.document.removeEventListener('mousemove', this.onPointerMove, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mousedown', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mouseout', this.onPointerOut, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('mouseover', this.onPointerOver, this._eventListenerOptions);
            self.removeEventListener('mouseup', this.onPointerUp, this._eventListenerOptions);
        }
        if (this.supportsTouchEvents) {
            this.interactionDOMElement.removeEventListener('touchstart', this.onPointerDown, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchcancel', this.onPointerCancel, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchend', this.onPointerUp, this._eventListenerOptions);
            this.interactionDOMElement.removeEventListener('touchmove', this.onPointerMove, this._eventListenerOptions);
        }
        this.interactionDOMElement = null;
        this.eventsAdded = false;
    };
    /**
     * Updates the state of interactive objects if at least {@link interactionFrequency}
     * milliseconds have passed since the last invocation.
     *
     * Invoked by a throttled ticker update from {@link PIXI.Ticker.system}.
     *
     * @param {number} deltaTime - time delta since the last call
     */
    InteractionManager.prototype.tickerUpdate = function (deltaTime) {
        this._deltaTime += deltaTime;
        if (this._deltaTime < this.interactionFrequency) {
            return;
        }
        this._deltaTime = 0;
        this.update();
    };
    /**
     * Updates the state of interactive objects.
     */
    InteractionManager.prototype.update = function () {
        if (!this.interactionDOMElement) {
            return;
        }
        // if the user move the mouse this check has already been done using the mouse move!
        if (this._didMove) {
            this._didMove = false;
            return;
        }
        this.cursor = null;
        // Resets the flag as set by a stopPropagation call. This flag is usually reset by a user interaction of any kind,
        // but there was a scenario of a display object moving under a static mouse cursor.
        // In this case, mouseover and mouseevents would not pass the flag test in dispatchEvent function
        for (var k in this.activeInteractionData) {
            // eslint-disable-next-line no-prototype-builtins
            if (this.activeInteractionData.hasOwnProperty(k)) {
                var interactionData = this.activeInteractionData[k];
                if (interactionData.originalEvent && interactionData.pointerType !== 'touch') {
                    var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, interactionData.originalEvent, interactionData);
                    this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, true);
                }
            }
        }
        this.setCursorMode(this.cursor);
    };
    /**
     * Sets the current cursor mode, handling any callbacks or CSS style changes.
     *
     * @param {string} mode - cursor mode, a key from the cursorStyles dictionary
     */
    InteractionManager.prototype.setCursorMode = function (mode) {
        mode = mode || 'default';
        var applyStyles = true;
        // offscreen canvas does not support setting styles, but cursor modes can be functions,
        // in order to handle pixi rendered cursors, so we can't bail
        if (self.OffscreenCanvas && this.interactionDOMElement instanceof OffscreenCanvas) {
            applyStyles = false;
        }
        // if the mode didn't actually change, bail early
        if (this.currentCursorMode === mode) {
            return;
        }
        this.currentCursorMode = mode;
        var style = this.cursorStyles[mode];
        // only do things if there is a cursor style for it
        if (style) {
            switch (typeof style) {
                case 'string':
                    // string styles are handled as cursor CSS
                    if (applyStyles) {
                        this.interactionDOMElement.style.cursor = style;
                    }
                    break;
                case 'function':
                    // functions are just called, and passed the cursor mode
                    style(mode);
                    break;
                case 'object':
                    // if it is an object, assume that it is a dictionary of CSS styles,
                    // apply it to the interactionDOMElement
                    if (applyStyles) {
                        Object.assign(this.interactionDOMElement.style, style);
                    }
                    break;
            }
        }
        else if (applyStyles && typeof mode === 'string' && !Object.prototype.hasOwnProperty.call(this.cursorStyles, mode)) {
            // if it mode is a string (not a Symbol) and cursorStyles doesn't have any entry
            // for the mode, then assume that the dev wants it to be CSS for the cursor.
            this.interactionDOMElement.style.cursor = mode;
        }
    };
    /**
     * Dispatches an event on the display object that was interacted with
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {PIXI.InteractionEvent} eventData - the event data object
     * @private
     */
    InteractionManager.prototype.dispatchEvent = function (displayObject, eventString, eventData) {
        // Even if the event was stopped, at least dispatch any remaining events
        // for the same display object.
        if (!eventData.stopPropagationHint || displayObject === eventData.stopsPropagatingAt) {
            eventData.currentTarget = displayObject;
            eventData.type = eventString;
            displayObject.emit(eventString, eventData);
            if (displayObject[eventString]) {
                displayObject[eventString](eventData);
            }
        }
    };
    /**
     * Puts a event on a queue to be dispatched later. This is used to guarantee correct
     * ordering of over/out events.
     *
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the display object in question
     * @param {string} eventString - the name of the event (e.g, mousedown)
     * @param {object} eventData - the event data object
     * @private
     */
    InteractionManager.prototype.delayDispatchEvent = function (displayObject, eventString, eventData) {
        this.delayedEvents.push({ displayObject: displayObject, eventString: eventString, eventData: eventData });
    };
    /**
     * Maps x and y coords from a DOM object and maps them correctly to the PixiJS view. The
     * resulting value is stored in the point. This takes into account the fact that the DOM
     * element could be scaled and positioned anywhere on the screen.
     *
     * @param  {PIXI.IPointData} point - the point that the result will be stored in
     * @param  {number} x - the x coord of the position to map
     * @param  {number} y - the y coord of the position to map
     */
    InteractionManager.prototype.mapPositionToPoint = function (point, x, y) {
        var rect;
        // IE 11 fix
        if (!this.interactionDOMElement.parentElement) {
            rect = {
                x: 0,
                y: 0,
                width: this.interactionDOMElement.width,
                height: this.interactionDOMElement.height,
                left: 0,
                top: 0
            };
        }
        else {
            rect = this.interactionDOMElement.getBoundingClientRect();
        }
        var resolutionMultiplier = 1.0 / this.resolution;
        point.x = ((x - rect.left) * (this.interactionDOMElement.width / rect.width)) * resolutionMultiplier;
        point.y = ((y - rect.top) * (this.interactionDOMElement.height / rect.height)) * resolutionMultiplier;
    };
    /**
     * This function is provides a neat way of crawling through the scene graph and running a
     * specified function on all interactive objects it finds. It will also take care of hit
     * testing the interactive objects and passes the hit across in the function.
     *
     * @protected
     * @param {PIXI.InteractionEvent} interactionEvent - event containing the point that
     *  is tested for collision
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - the displayObject
     *  that will be hit test (recursively crawls its children)
     * @param {Function} [func] - the function that will be called on each interactive object. The
     *  interactionEvent, displayObject and hit will be passed to the function
     * @param {boolean} [hitTest] - indicates whether we want to calculate hits
     *  or just iterate through all interactive objects
     */
    InteractionManager.prototype.processInteractive = function (interactionEvent, displayObject, func, hitTest) {
        var hit = this.search.findHit(interactionEvent, displayObject, func, hitTest);
        var delayedEvents = this.delayedEvents;
        if (!delayedEvents.length) {
            return hit;
        }
        // Reset the propagation hint, because we start deeper in the tree again.
        interactionEvent.stopPropagationHint = false;
        var delayedLen = delayedEvents.length;
        this.delayedEvents = [];
        for (var i = 0; i < delayedLen; i++) {
            var _a = delayedEvents[i], displayObject_1 = _a.displayObject, eventString = _a.eventString, eventData = _a.eventData;
            // When we reach the object we wanted to stop propagating at,
            // set the propagation hint.
            if (eventData.stopsPropagatingAt === displayObject_1) {
                eventData.stopPropagationHint = true;
            }
            this.dispatchEvent(displayObject_1, eventString, eventData);
        }
        return hit;
    };
    /**
     * Is called when the pointer button is pressed down on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being pressed down
     */
    InteractionManager.prototype.onPointerDown = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
        var events = this.normalizeToPointerData(originalEvent);
        /*
         * No need to prevent default on natural pointer events, as there are no side effects
         * Normalized events, however, may have the double mousedown/touchstart issue on the native android browser,
         * so still need to be prevented.
         */
        // Guaranteed that there will be at least one event in events, and all events must have the same pointer type
        if (this.autoPreventDefault && events[0].isNormalized) {
            var cancelable = originalEvent.cancelable || !('cancelable' in originalEvent);
            if (cancelable) {
                originalEvent.preventDefault();
            }
        }
        var eventLen = events.length;
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerDown, true);
            this.emit('pointerdown', interactionEvent);
            if (event.pointerType === 'touch') {
                this.emit('touchstart', interactionEvent);
            }
            // emit a mouse event for "pen" pointers, the way a browser would emit a fallback event
            else if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                var isRightButton = event.button === 2;
                this.emit(isRightButton ? 'rightdown' : 'mousedown', this.eventData);
            }
        }
    };
    /**
     * Processes the result of the pointer down check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerDown = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        if (hit) {
            if (!displayObject.trackedPointers[id]) {
                displayObject.trackedPointers[id] = new InteractionTrackingData(id);
            }
            this.dispatchEvent(displayObject, 'pointerdown', interactionEvent);
            if (data.pointerType === 'touch') {
                this.dispatchEvent(displayObject, 'touchstart', interactionEvent);
            }
            else if (data.pointerType === 'mouse' || data.pointerType === 'pen') {
                var isRightButton = data.button === 2;
                if (isRightButton) {
                    displayObject.trackedPointers[id].rightDown = true;
                }
                else {
                    displayObject.trackedPointers[id].leftDown = true;
                }
                this.dispatchEvent(displayObject, isRightButton ? 'rightdown' : 'mousedown', interactionEvent);
            }
        }
    };
    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being released
     * @param {boolean} cancelled - true if the pointer is cancelled
     * @param {Function} func - Function passed to {@link processInteractive}
     */
    InteractionManager.prototype.onPointerComplete = function (originalEvent, cancelled, func) {
        var events = this.normalizeToPointerData(originalEvent);
        var eventLen = events.length;
        // if the event wasn't targeting our canvas, then consider it to be pointerupoutside
        // in all cases (unless it was a pointercancel)
        var eventAppend = originalEvent.target !== this.interactionDOMElement ? 'outside' : '';
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            // perform hit testing for events targeting our canvas or cancel events
            this.processInteractive(interactionEvent, this.lastObjectRendered, func, cancelled || !eventAppend);
            this.emit(cancelled ? 'pointercancel' : "pointerup" + eventAppend, interactionEvent);
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
                var isRightButton = event.button === 2;
                this.emit(isRightButton ? "rightup" + eventAppend : "mouseup" + eventAppend, interactionEvent);
            }
            else if (event.pointerType === 'touch') {
                this.emit(cancelled ? 'touchcancel' : "touchend" + eventAppend, interactionEvent);
                this.releaseInteractionDataForPointerId(event.pointerId);
            }
        }
    };
    /**
     * Is called when the pointer button is cancelled
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    InteractionManager.prototype.onPointerCancel = function (event) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && event.pointerType === 'touch')
            { return; }
        this.onPointerComplete(event, true, this.processPointerCancel);
    };
    /**
     * Processes the result of the pointer cancel check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     */
    InteractionManager.prototype.processPointerCancel = function (interactionEvent, displayObject) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        if (displayObject.trackedPointers[id] !== undefined) {
            delete displayObject.trackedPointers[id];
            this.dispatchEvent(displayObject, 'pointercancel', interactionEvent);
            if (data.pointerType === 'touch') {
                this.dispatchEvent(displayObject, 'touchcancel', interactionEvent);
            }
        }
    };
    /**
     * Is called when the pointer button is released on the renderer element
     *
     * @private
     * @param {PointerEvent} event - The DOM event of a pointer button being released
     */
    InteractionManager.prototype.onPointerUp = function (event) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && event.pointerType === 'touch')
            { return; }
        this.onPointerComplete(event, false, this.processPointerUp);
    };
    /**
     * Processes the result of the pointer up check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerUp = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        var trackingData = displayObject.trackedPointers[id];
        var isTouch = data.pointerType === 'touch';
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        // need to track mouse down status in the mouse block so that we can emit
        // event in a later block
        var isMouseTap = false;
        // Mouse only
        if (isMouse) {
            var isRightButton = data.button === 2;
            var flags = InteractionTrackingData.FLAGS;
            var test = isRightButton ? flags.RIGHT_DOWN : flags.LEFT_DOWN;
            var isDown = trackingData !== undefined && (trackingData.flags & test);
            if (hit) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightup' : 'mouseup', interactionEvent);
                if (isDown) {
                    this.dispatchEvent(displayObject, isRightButton ? 'rightclick' : 'click', interactionEvent);
                    // because we can confirm that the mousedown happened on this object, flag for later emit of pointertap
                    isMouseTap = true;
                }
            }
            else if (isDown) {
                this.dispatchEvent(displayObject, isRightButton ? 'rightupoutside' : 'mouseupoutside', interactionEvent);
            }
            // update the down state of the tracking data
            if (trackingData) {
                if (isRightButton) {
                    trackingData.rightDown = false;
                }
                else {
                    trackingData.leftDown = false;
                }
            }
        }
        // Pointers and Touches, and Mouse
        if (hit) {
            this.dispatchEvent(displayObject, 'pointerup', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchend', interactionEvent); }
            if (trackingData) {
                // emit pointertap if not a mouse, or if the mouse block decided it was a tap
                if (!isMouse || isMouseTap) {
                    this.dispatchEvent(displayObject, 'pointertap', interactionEvent);
                }
                if (isTouch) {
                    this.dispatchEvent(displayObject, 'tap', interactionEvent);
                    // touches are no longer over (if they ever were) when we get the touchend
                    // so we should ensure that we don't keep pretending that they are
                    trackingData.over = false;
                }
            }
        }
        else if (trackingData) {
            this.dispatchEvent(displayObject, 'pointerupoutside', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchendoutside', interactionEvent); }
        }
        // Only remove the tracking data if there is no over/down state still associated with it
        if (trackingData && trackingData.none) {
            delete displayObject.trackedPointers[id];
        }
    };
    /**
     * Is called when the pointer moves across the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer moving
     */
    InteractionManager.prototype.onPointerMove = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
        var events = this.normalizeToPointerData(originalEvent);
        if (events[0].pointerType === 'mouse' || events[0].pointerType === 'pen') {
            this._didMove = true;
            this.cursor = null;
        }
        var eventLen = events.length;
        for (var i = 0; i < eventLen; i++) {
            var event = events[i];
            var interactionData = this.getInteractionDataForPointerId(event);
            var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
            interactionEvent.data.originalEvent = originalEvent;
            this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerMove, true);
            this.emit('pointermove', interactionEvent);
            if (event.pointerType === 'touch')
                { this.emit('touchmove', interactionEvent); }
            if (event.pointerType === 'mouse' || event.pointerType === 'pen')
                { this.emit('mousemove', interactionEvent); }
        }
        if (events[0].pointerType === 'mouse') {
            this.setCursorMode(this.cursor);
            // TODO BUG for parents interactive object (border order issue)
        }
    };
    /**
     * Processes the result of the pointer move check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerMove = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var isTouch = data.pointerType === 'touch';
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        if (isMouse) {
            this.processPointerOverOut(interactionEvent, displayObject, hit);
        }
        if (!this.moveWhenInside || hit) {
            this.dispatchEvent(displayObject, 'pointermove', interactionEvent);
            if (isTouch)
                { this.dispatchEvent(displayObject, 'touchmove', interactionEvent); }
            if (isMouse)
                { this.dispatchEvent(displayObject, 'mousemove', interactionEvent); }
        }
    };
    /**
     * Is called when the pointer is moved out of the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer being moved out
     */
    InteractionManager.prototype.onPointerOut = function (originalEvent) {
        // if we support touch events, then only use those for touch events, not pointer events
        if (this.supportsTouchEvents && originalEvent.pointerType === 'touch')
            { return; }
        var events = this.normalizeToPointerData(originalEvent);
        // Only mouse and pointer can call onPointerOut, so events will always be length 1
        var event = events[0];
        if (event.pointerType === 'mouse') {
            this.mouseOverRenderer = false;
            this.setCursorMode(null);
        }
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = event;
        this.processInteractive(interactionEvent, this.lastObjectRendered, this.processPointerOverOut, false);
        this.emit('pointerout', interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            this.emit('mouseout', interactionEvent);
        }
        else {
            // we can get touchleave events after touchend, so we want to make sure we don't
            // introduce memory leaks
            this.releaseInteractionDataForPointerId(interactionData.identifier);
        }
    };
    /**
     * Processes the result of the pointer over/out check and dispatches the event if need be
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The interaction event wrapping the DOM event
     * @param {PIXI.Container|PIXI.Sprite|PIXI.TilingSprite} displayObject - The display object that was tested
     * @param {boolean} hit - the result of the hit test on the display object
     */
    InteractionManager.prototype.processPointerOverOut = function (interactionEvent, displayObject, hit) {
        var data = interactionEvent.data;
        var id = interactionEvent.data.identifier;
        var isMouse = (data.pointerType === 'mouse' || data.pointerType === 'pen');
        var trackingData = displayObject.trackedPointers[id];
        // if we just moused over the display object, then we need to track that state
        if (hit && !trackingData) {
            trackingData = displayObject.trackedPointers[id] = new InteractionTrackingData(id);
        }
        if (trackingData === undefined)
            { return; }
        if (hit && this.mouseOverRenderer) {
            if (!trackingData.over) {
                trackingData.over = true;
                this.delayDispatchEvent(displayObject, 'pointerover', interactionEvent);
                if (isMouse) {
                    this.delayDispatchEvent(displayObject, 'mouseover', interactionEvent);
                }
            }
            // only change the cursor if it has not already been changed (by something deeper in the
            // display tree)
            if (isMouse && this.cursor === null) {
                this.cursor = displayObject.cursor;
            }
        }
        else if (trackingData.over) {
            trackingData.over = false;
            this.dispatchEvent(displayObject, 'pointerout', this.eventData);
            if (isMouse) {
                this.dispatchEvent(displayObject, 'mouseout', interactionEvent);
            }
            // if there is no mouse down information for the pointer, then it is safe to delete
            if (trackingData.none) {
                delete displayObject.trackedPointers[id];
            }
        }
    };
    /**
     * Is called when the pointer is moved into the renderer element
     *
     * @private
     * @param {PointerEvent} originalEvent - The DOM event of a pointer button being moved into the renderer view
     */
    InteractionManager.prototype.onPointerOver = function (originalEvent) {
        var events = this.normalizeToPointerData(originalEvent);
        // Only mouse and pointer can call onPointerOver, so events will always be length 1
        var event = events[0];
        var interactionData = this.getInteractionDataForPointerId(event);
        var interactionEvent = this.configureInteractionEventForDOMEvent(this.eventData, event, interactionData);
        interactionEvent.data.originalEvent = event;
        if (event.pointerType === 'mouse') {
            this.mouseOverRenderer = true;
        }
        this.emit('pointerover', interactionEvent);
        if (event.pointerType === 'mouse' || event.pointerType === 'pen') {
            this.emit('mouseover', interactionEvent);
        }
    };
    /**
     * Get InteractionData for a given pointerId. Store that data as well
     *
     * @private
     * @param {PointerEvent} event - Normalized pointer event, output from normalizeToPointerData
     * @return {PIXI.InteractionData} - Interaction data for the given pointer identifier
     */
    InteractionManager.prototype.getInteractionDataForPointerId = function (event) {
        var pointerId = event.pointerId;
        var interactionData;
        if (pointerId === MOUSE_POINTER_ID || event.pointerType === 'mouse') {
            interactionData = this.mouse;
        }
        else if (this.activeInteractionData[pointerId]) {
            interactionData = this.activeInteractionData[pointerId];
        }
        else {
            interactionData = this.interactionDataPool.pop() || new InteractionData();
            interactionData.identifier = pointerId;
            this.activeInteractionData[pointerId] = interactionData;
        }
        // copy properties from the event, so that we can make sure that touch/pointer specific
        // data is available
        interactionData.copyEvent(event);
        return interactionData;
    };
    /**
     * Return unused InteractionData to the pool, for a given pointerId
     *
     * @private
     * @param {number} pointerId - Identifier from a pointer event
     */
    InteractionManager.prototype.releaseInteractionDataForPointerId = function (pointerId) {
        var interactionData = this.activeInteractionData[pointerId];
        if (interactionData) {
            delete this.activeInteractionData[pointerId];
            interactionData.reset();
            this.interactionDataPool.push(interactionData);
        }
    };
    /**
     * Configure an InteractionEvent to wrap a DOM PointerEvent and InteractionData
     *
     * @private
     * @param {PIXI.InteractionEvent} interactionEvent - The event to be configured
     * @param {PointerEvent} pointerEvent - The DOM event that will be paired with the InteractionEvent
     * @param {PIXI.InteractionData} interactionData - The InteractionData that will be paired
     *        with the InteractionEvent
     * @return {PIXI.InteractionEvent} the interaction event that was passed in
     */
    InteractionManager.prototype.configureInteractionEventForDOMEvent = function (interactionEvent, pointerEvent, interactionData) {
        interactionEvent.data = interactionData;
        this.mapPositionToPoint(interactionData.global, pointerEvent.clientX, pointerEvent.clientY);
        // Not really sure why this is happening, but it's how a previous version handled things
        if (pointerEvent.pointerType === 'touch') {
            pointerEvent.globalX = interactionData.global.x;
            pointerEvent.globalY = interactionData.global.y;
        }
        interactionData.originalEvent = pointerEvent;
        interactionEvent.reset();
        return interactionEvent;
    };
    /**
     * Ensures that the original event object contains all data that a regular pointer event would have
     *
     * @private
     * @param {TouchEvent|MouseEvent|PointerEvent} event - The original event data from a touch or mouse event
     * @return {PointerEvent[]} An array containing a single normalized pointer event, in the case of a pointer
     *  or mouse event, or a multiple normalized pointer events if there are multiple changed touches
     */
    InteractionManager.prototype.normalizeToPointerData = function (event) {
        var normalizedEvents = [];
        if (this.supportsTouchEvents && event instanceof TouchEvent) {
            for (var i = 0, li = event.changedTouches.length; i < li; i++) {
                var touch = event.changedTouches[i];
                if (typeof touch.button === 'undefined')
                    { touch.button = event.touches.length ? 1 : 0; }
                if (typeof touch.buttons === 'undefined')
                    { touch.buttons = event.touches.length ? 1 : 0; }
                if (typeof touch.isPrimary === 'undefined') {
                    touch.isPrimary = event.touches.length === 1 && event.type === 'touchstart';
                }
                if (typeof touch.width === 'undefined')
                    { touch.width = touch.radiusX || 1; }
                if (typeof touch.height === 'undefined')
                    { touch.height = touch.radiusY || 1; }
                if (typeof touch.tiltX === 'undefined')
                    { touch.tiltX = 0; }
                if (typeof touch.tiltY === 'undefined')
                    { touch.tiltY = 0; }
                if (typeof touch.pointerType === 'undefined')
                    { touch.pointerType = 'touch'; }
                if (typeof touch.pointerId === 'undefined')
                    { touch.pointerId = touch.identifier || 0; }
                if (typeof touch.pressure === 'undefined')
                    { touch.pressure = touch.force || 0.5; }
                if (typeof touch.twist === 'undefined')
                    { touch.twist = 0; }
                if (typeof touch.tangentialPressure === 'undefined')
                    { touch.tangentialPressure = 0; }
                // TODO: Remove these, as layerX/Y is not a standard, is deprecated, has uneven
                // support, and the fill ins are not quite the same
                // offsetX/Y might be okay, but is not the same as clientX/Y when the canvas's top
                // left is not 0,0 on the page
                if (typeof touch.layerX === 'undefined')
                    { touch.layerX = touch.offsetX = touch.clientX; }
                if (typeof touch.layerY === 'undefined')
                    { touch.layerY = touch.offsetY = touch.clientY; }
                // mark the touch as normalized, just so that we know we did it
                touch.isNormalized = true;
                normalizedEvents.push(touch);
            }
        }
        // apparently PointerEvent subclasses MouseEvent, so yay
        else if (!self.MouseEvent
            || (event instanceof MouseEvent && (!this.supportsPointerEvents || !(event instanceof self.PointerEvent)))) {
            var tempEvent = event;
            if (typeof tempEvent.isPrimary === 'undefined')
                { tempEvent.isPrimary = true; }
            if (typeof tempEvent.width === 'undefined')
                { tempEvent.width = 1; }
            if (typeof tempEvent.height === 'undefined')
                { tempEvent.height = 1; }
            if (typeof tempEvent.tiltX === 'undefined')
                { tempEvent.tiltX = 0; }
            if (typeof tempEvent.tiltY === 'undefined')
                { tempEvent.tiltY = 0; }
            if (typeof tempEvent.pointerType === 'undefined')
                { tempEvent.pointerType = 'mouse'; }
            if (typeof tempEvent.pointerId === 'undefined')
                { tempEvent.pointerId = MOUSE_POINTER_ID; }
            if (typeof tempEvent.pressure === 'undefined')
                { tempEvent.pressure = 0.5; }
            if (typeof tempEvent.twist === 'undefined')
                { tempEvent.twist = 0; }
            if (typeof tempEvent.tangentialPressure === 'undefined')
                { tempEvent.tangentialPressure = 0; }
            // mark the mouse event as normalized, just so that we know we did it
            tempEvent.isNormalized = true;
            normalizedEvents.push(tempEvent);
        }
        else {
            normalizedEvents.push(event);
        }
        return normalizedEvents;
    };
    /**
     * Destroys the interaction manager
     *
     */
    InteractionManager.prototype.destroy = function () {
        this.removeEvents();
        this.removeTickerListener();
        this.removeAllListeners();
        this.renderer = null;
        this.mouse = null;
        this.eventData = null;
        this.interactionDOMElement = null;
        this.onPointerDown = null;
        this.processPointerDown = null;
        this.onPointerUp = null;
        this.processPointerUp = null;
        this.onPointerCancel = null;
        this.processPointerCancel = null;
        this.onPointerMove = null;
        this.processPointerMove = null;
        this.onPointerOut = null;
        this.processPointerOverOut = null;
        this.onPointerOver = null;
        this.search = null;
    };
    return InteractionManager;
}(EventEmitter));

/**
 * BaseInput class that provide a interface for subclasses that handle input for Charts
 */
class BaseInput extends EventEmitter {
    /**
     * Should be called when input a registered for specific chart
     * Can be invoked a more times for multichart apps
     */
    












}

class PixiInput extends BaseInput {
	 __init() {this._charts = new Set();}
	 __init2() {this._eventsRegistered = false;}

	constructor(
		  provider
	) {
		super();this.provider = provider;PixiInput.prototype.__init.call(this);PixiInput.prototype.__init2.call(this);
		this._onPointerUp = this._onPointerUp.bind(this);
		this._onPointerDown = this._onPointerDown.bind(this);
		this._onPointerMove = this._onPointerDown.bind(this);
		this._onPointerTap = this._onPointerTap.bind(this);

		this._onWheel = this._onWheel.bind(this);
	}

	 _attachEvents() {
		if (this._eventsRegistered) {
			return;
		}

		const p = this.provider;

		p.on('pointerup', this._onPointerUp, this);
		p.on('pointerupoutside', this._onPointerUp, this);
        p.on('pointerdown', this._onPointerDown, this);
        p.on('pointermove', this._onPointerMove, this);
        p.on('pointertap', this._onPointerTap, this);

        // handle native wheel

        if ((p ).interactionDOMElement) {
            (p ).interactionDOMElement.addEventListener('wheel', this._onWheel, {passive: false});
        } else {
            document.addEventListener('wheel', this._onWheel, {passive: false});
        }

        this._eventsRegistered = true;
	}

	 _onWheel (event) {
	    event.preventDefault();
    }

	 _onPointerTap (event) {

    }

	 _onPointerMove (event) {

    }

	 _onPointerUp (event) {

    }

     _onPointerDown (event) {

    }

	 _detachEvents() {
		if (!this._eventsRegistered) {
			return;
		}

        const p = this.provider;

        p.off('pointerup', this._onPointerUp, this);
        p.off('pointerupoutside', this._onPointerUp, this);
        p.off('pointerdown', this._onPointerDown, this);
        p.off('pointermove', this._onPointerMove, this);
        p.off('pointertap', this._onPointerTap, this);

        // unlink
        if ((p ).interactionDOMElement) {
            (p ).interactionDOMElement.removeEventListener('wheel', this._onWheel);
        } else {
            document.removeEventListener('wheel', this._onWheel);
        }

		this._eventsRegistered = false;
	}

	 register(chart) {
		if (this._charts.has(chart))
			return;

		this._charts.add(chart);
		this._attachEvents();
	}

	 unregister(chart) {
		this._charts.delete(chart);

		if (this._charts.size === 0) {
			this._detachEvents();
		}
	}

	 update(deltaTime) {

    }
}

class Transform extends EventEmitter  {constructor(...args) { super(...args); Transform.prototype.__init.call(this);Transform.prototype.__init2.call(this);Transform.prototype.__init3.call(this);Transform.prototype.__init4.call(this); }
     static  __initStatic() {this.CHANGE = 'CHANGE';}

    __init() {this.tx = 0;}
    __init2() {this.ty = 0;}
    __init3() {this.sx = 1;}
    __init4() {this.sy = 1;}

    apply(from, to = {...from}) {
        to.x = from.x * this.sx + this.tx;
        to.y = from.y * this.sy + this.ty;

        return to;
    }

    translate (tx = 0, ty = tx) {
        this.tx += tx;
        this.ty += ty;

        this._change();

        return this;
    }

    set (t) {
        this.sx = t.sx;
        this.sy = t.sy;
        this.tx = t.tx;
        this.ty = t.ty;

        this._change();
    }

    scale (sx = 1, sy = 1) {
        this.sx *= sx;
        this.sy *= sy;
        this.tx *= sx;
        this.ty *= sy;

        this._change();

        return this;
    }

    identity() {
        this.tx = this.sx = 0;
        this.sx = this.sy = 1;

        this._change();
    }

    invert(self = true) {
        const sx = this.sx;
        const sy = this.sy;

        const target = self ? this : new Transform();
        target.sx = 1 / sx;
        target.sy = 1 / sy;
        target.tx = - sx * this.tx;
        target.ty = - sy * this.ty;

        target._change();

        return target;
    }

    mul(transform, self = true) {
        const {
            tx, ty, sx, sy
        } = this;

        const target = self ? this : new Transform();

        target.sx = transform.sx * sx;
        target.sy = transform.sy * sy;
        target.tx = transform.tx * sx + tx;
        target.ty = transform.ty * sy + ty;

        this._change();

        return target;
    }

     _change() {
        this.emit(Transform.CHANGE, this);
    }
} Transform.__initStatic();

class Observable extends EventEmitter {
     static __initStatic() {this.CHANGE_EVENT = 'change';}
     __init() {this._dirtyId = 0;}

    constructor (fields) {
        super();Observable.prototype.__init.call(this);Observable.prototype.__init2.call(this);Observable.prototype.__init3.call(this);
        if (fields) {
            this.wrap(fields, this);
        }
    }


     _broadcast (name, oldValue, newValue) {
        if (this._suspended) {
            return;
        }

        this.emit(Observable.CHANGE_EVENT, {
            target: this,
            name,
            oldValue,
            newValue
        });
    }

     __init2() {this._suspended = false;}
     __init3() {this._dirtyBeforeSuspend = 0;}

    /**
     * Suspend and not emit change events while suspended
     * @protected
     */
     set suspended(v) {
        if (v === this._suspended) {
            return;
        }

        if (v) {
            this._dirtyBeforeSuspend = this._dirtyId;
            this._suspended = true;
        } else {
            this._suspended = false;

            if (this._dirtyId !== this._dirtyBeforeSuspend) {
                this._broadcast();
            }

            this._dirtyBeforeSuspend = -1;
        }
    }

     get suspended () {
        return this._suspended;
    }

     dirtyId () {
        return this._dirtyId;
    }

     wrap  (fields, target) {
        target = target ;

        for (const key of fields) {
            Object.defineProperty(target, key, {
                set (v) {
                    const old = this['_' + key];
                    this['_' + key] = v;

                    if (old !== v) {
                        target._dirtyId ++;
                        target._broadcast (key, old, v);
                    }
                },

                get () {
                    return this['_' + key];
                }
            });
        }

        return target;
    }
} Observable.__initStatic();

class Range extends Observable {
     __init() {this._fromX = 0;}
     __init2() {this._toX = 0;}
     __init3() {this._fromY = 0;}
     __init4() {this._toY = 0;}

    
    
    
    

    constructor (data = {}) {
        super([
            'fromX', 'fromY', 'toX', 'toY'
        ]);Range.prototype.__init.call(this);Range.prototype.__init2.call(this);Range.prototype.__init3.call(this);Range.prototype.__init4.call(this);
        data && this.set(data);
    }

     get width() {
        return this.toX - this.fromX;
    }

     get height() {
        return this.toY - this.fromY;
    }

     set ({ fromX = this._fromX, fromY = this._fromY, toX = this._toX, toY = this._toY } = {}) {
        this.suspended = true;

        this.fromX = fromX;
        this.fromY = fromY;
        this.toX = toX;
        this.toY = toY;

        this.suspended = false;
    }

    /**
     * Scale current range
     * @param x
     * @param y
     * @param limit
     */
     scale(x, y = x, limit = null) {
        const def = this.suspended;

        this.suspended = true;

        this.toX *= x;
        this.toY *= y;
        this.fromX *= x;
        this.fromY *= y;

        if (limit) {
            this.clampToMin(limit);
        }

        this.suspended = def;
    }

    /**
     * Translate current range
     * @param tx
     * @param ty
     * @param limit
     */
     translate(tx, ty = 0, limit = null) {
        const def = this.suspended;

        this.suspended = true;

        const {
            _fromX, _fromY, _toX, _toY
        } = this;

        if (limit) {
            // looks to left and clamp min
            if (tx > 0) {
                this.fromX = Math.min(limit.fromX, this._fromX + tx);
                this.toX = this.fromX + (_toX - _fromX);
            // looks to right and clamp by max
            } else if (tx < 0) {
                this.toX = Math.max(this._toX + tx, limit.toX);
                this.fromX = this.toX - (_toX - _fromX);
            }

            // looks to left and clamp min
            if (ty > 0) {
                this.fromY = Math.min(limit.fromY, this._fromY + ty);
                this.toY = this.fromY + (_toY - _fromY);
                // looks to right and clamp by max
            } else if (ty < 0) {
                this.toY = Math.max(this._toY + ty, limit.toY);
                this.fromY = this.toY - (_toY - _fromY);
            }

        } else {
            this.fromX += tx;
            this.toX += tx;

            this.fromY += ty;
            this.toY += ty;
        }

        this.suspended = def;
    }

    /**
     * Compute transformation between this range and required
     */
     decomposeFrom (source, transform, align = 'left') {
        const t = transform || new Transform();
        const sw = source.toX - source.fromX;
        const sh = source.toY - source.fromY;

        t.sx = (this.width / sw) || 1;
        t.sy = (this.height / sh) || 1;

        if (align === 'left') {
            t.tx = (this.fromX - source.fromX);
            t.ty = (this.fromY - source.fromY);
        } else {
            t.tx = -(this.toX - source.toX);
            t.ty = -(this.toY - source.toY);
        }

        return t;
    }

     transform(transform, limit) {
        this.scale(transform.sx, transform.sy, limit);
        this.translate(transform.tx, transform.ty, limit);
    }

    /**
     * Clamp range by minimal allowed view. This means that range never bee less that limit
     * This change a height/width, for clamping a position only use
     * @see clampPosition
     * @param { Range } limit target range limit
     */
     clampToMin (limit) {
        const def = this.suspended;

        this.suspended = true;

        const {
            _fromX, _fromY, _toX, _toY
        } = this;


        this.fromX = Math.min (limit.fromX, _fromX);
        this.fromY = Math.min (limit.fromY, _fromY);
        this.toX = Math.max(limit.toX, _toX);
        this.toY = Math.max(limit.toY, _toY);

        this.suspended = def;
    }
}

var CHART_EVENTS; (function (CHART_EVENTS) {
	const UPDATE = 'chart:update'; CHART_EVENTS["UPDATE"] = UPDATE;
	const DESTROY = 'chart:destroy'; CHART_EVENTS["DESTROY"] = DESTROY;
    const RESIZE = 'chart:resize'; CHART_EVENTS["RESIZE"] = RESIZE;
})(CHART_EVENTS || (CHART_EVENTS = {}));

var CHART_TYPE; (function (CHART_TYPE) {
    const BAR = 'bar'; CHART_TYPE["BAR"] = BAR;
    const LINE = 'line'; CHART_TYPE["LINE"] = LINE;
    const AREA = 'area'; CHART_TYPE["AREA"] = AREA;
})(CHART_TYPE || (CHART_TYPE = {}));

function toNumberOrNaN(num) {
    if (num === null || num === undefined) {
        return NaN;
    }
    return +num;
}

class ArrayChainDataProvider  {

    constructor (
         data
    ) {this.data = data;}

     _fetchValueInternal (index) {
        const chain = this.data ;
        const entry = chain[index];

        return {
            x: +entry[0],
            y: toNumberOrNaN(entry[1]),
            labelX: entry[0],
            labelY: entry[1],
            index
        };
    }

    fetch(from = 0, to){
        const chain = this.data ;

        to = to || (chain.length);
        to = Math.min(chain.length, Math.max(from, to));

        const data = [];

        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;

        for (let i = 0; i < to - from; i ++) {
            data[i] = this._fetchValueInternal(i + from);

            minX = Math.min(data[i].x, minX);
            maxX = Math.max(data[i].x, maxX);
            if (!isNaN(data[i].y)) {
                minY = Math.min(data[i].y, minY);
                maxY = Math.max(data[i].y, maxY);
            }
        }

        return Object.freeze({
            data: data,
            fromX: from,
            toX: to,
            dataBounds: Object.freeze({
                fromX: minX,
                fromY: minY,
                toX: maxX,
                toY: maxY
            })
        });
    }
}

class ArrayLikeDataProvider  {
    constructor(
         data,
          label = false,
         step = 10) {this.data = data;this.label = label;this.step = step;}

    fetch (from = 0, to = this.data.length - 1) {
        const arrayLike = this.data ;

        to = to || (arrayLike.length - 1);
        to = Math.min(arrayLike.length - 1, Math.max(from, to));

        if (this.label) {
            return {
                data: arrayLike.slice(from, to) ,
                fromX: from,
                toX: to,
                dataBounds: {
                    // @todo Compute bounds for label data
                    fromX: 0, toX: 0, fromY: 0, toY: 0,
                }
            };
        }

        let minY = Infinity;
        let maxY = -Infinity;

        const data = arrayLike.slice(from, to)
                .map((e, i) => {
                    e = toNumberOrNaN(e);
                    if (!isNaN(e)) {
                        minY = Math.min(e, minY);
                        maxY = Math.max(e, maxY);
                    }

                    const x = (i + from) * this.step;
                    const y = e;
                    return {
                        x,
                        y,
                        labelX: x,
                        labelY: y,
                        index: i + from
                    };
                });

        return Object.freeze({
            data: data ,
            fromX: from,
            toX: to,
            dataBounds: Object.freeze({
                fromX: data[0].x,
                toX: data[data.length - 1].x,
                fromY: minY,
                toY: maxY
            })
        });
    }
}

function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }
class ObjectDataProvider extends ArrayChainDataProvider {
	 _fetchValueInternal(index) {
		const chain = this.data ;
		const entry = chain[index];

        entry.y = toNumberOrNaN(entry.y);
		entry.labelX = _nullishCoalesce(entry.labelX, () => ( entry.x));
		entry.labelY = _nullishCoalesce(entry.labelY, () => ( entry.y));
		entry.index = index;

		return entry;
	}
}

/**
 * Validate a type of plugin and return valid plugin
 * @param plugin
 */
function getPluginInstance (plugin)
{
    if (!plugin) {
        return null;
    }

    if (typeof plugin === "function") {
        const proto = plugin.prototype;

        // () => {} not a have prototype
        if (!proto) {
            return plugin;
        }

        // class constructor
        if (
            'init' in proto ||
            'processElements' in proto ||
            'processResult' in proto
        ) {
            // is object constructor
            return new (plugin)();
        }

        // regular function, i think, wrap
        return { name: plugin.name, processElements: plugin };
    }

    // object notated plugin
    if ( typeof plugin === 'object' &&
        (
            'init' in plugin ||
            'processElements' in plugin ||
            'processResult' in plugin
        )
    ) {
        return plugin;
    }

    return null;
}

/**
 * Pluggable data Provider/Plugin, used for composite all plugins and providers together
 */
class PluggableProvider  {
      __init() {this.name = 'PluggableProvider';}

     static  __initStatic() {this.plugins = [];}

     static registerPlugin (plugin) {

        plugin = getPluginInstance(plugin);

        if (!plugin) {
            return false;
        }

        this.plugins.push(plugin);

        return true;
    }

      __init2() {this._plugins = [];}
      __init3() {this._activePlugins = [];}
     __init4() {this._sessionPlugins = [];}

    constructor(
         sourceProvider,
         chart,
        plugins = []
    ) {this.sourceProvider = sourceProvider;this.chart = chart;PluggableProvider.prototype.__init.call(this);PluggableProvider.prototype.__init2.call(this);PluggableProvider.prototype.__init3.call(this);PluggableProvider.prototype.__init4.call(this);
        this._plugins = [
            ...PluggableProvider.plugins,
            ...plugins.map(e => getPluginInstance(e)).filter(Boolean)
        ];
    }

    /**
     * Register session used plugins, sessions used plugins drops after fetch
     * @param {(IDataPlugin | IFunctionDataPlugin)[]} sessionPlugins
     */
     use (...sessionPlugins) {
        for (const p of sessionPlugins) {
            const valid = getPluginInstance(p);

            if (!valid) {
                continue;
            }

            this._sessionPlugins.push(valid);
        }
    }

    init()
    {
        this._activePlugins.length = 0;

        for (const p of this._plugins) {

            if (!p.init || p.init(this)) {
                this._activePlugins.push(p);
            }
        }

        for(const p of this._sessionPlugins) {
            if (!p.init || p.init(this)) {
                this._activePlugins.push(p);
            }
        }

        return  true;
    }

    processElements (result, source)
    {
        for (const p of this._activePlugins) {
            if (!p.processElements) {
                continue;
            }

            result = p.processElements(result, source);

            if (!result || !result.data) {
                throw new Error('Illegal output (null not allowed) by:' + p.name);
            }
        }

        return result;
    }

     fetch(from, to) {
        this.init();

        const source = this.sourceProvider.fetch(from, to);
        let result = {... source };
        result.dataBounds = { ... result.dataBounds };

        result =  this.processElements(result, source);

        // disable plugins
        this._sessionPlugins.length = 0;
        this._activePlugins.length = 0;

        return result;
    }
} PluggableProvider.__initStatic();

class DataBounds  {constructor() { DataBounds.prototype.__init.call(this);DataBounds.prototype.__init2.call(this);DataBounds.prototype.__init3.call(this);DataBounds.prototype.__init4.call(this); }
    __init() {this.fromX = Infinity;}
    __init2() {this.toX = -Infinity;}
    __init3() {this.fromY = Infinity;}
    __init4() {this.toY = -Infinity;}

    grown ({x, y} ) {
        if (x < this.fromX) this.fromX = x;
        if (x > this.toX) this.toX = x;

        if (y < this.fromY) this.fromY = y;
        if (y > this.toY) this.toY = y;
    }
}
/**
 * Data transform plugin, used for converting a input data space to Chart range values,
 */
class DataTransformPlugin  {constructor() { DataTransformPlugin.prototype.__init5.call(this);DataTransformPlugin.prototype.__init6.call(this); }
	  __init5() {this.name = 'DataTransformPlugin';}

	

	  __init6() {this.reduceXRange = true;}


	/**
	 * @implements IDataPlugin
	 * @inheritDoc
     *
	 */
	init(context) {
		this.context = context;
		return true;
	}

	/**
	 * @implements IDataPlugin
	 * @inheritDoc
	 */
	processElements(result, source) {
	    const chart = this.context.chart;
		const {
		    fitYRange
        } = chart.options.style;

		const data = result.data;

		let {
		    fromX: limitLeft,
            toX: limitRight
        } = chart.limits;

		const b = chart.parent
            ? chart.parent.dataProvider.sourceProvider.fetch().dataBounds
            : source.dataBounds;


        const t = chart.range.decomposeFrom(b);
		const output = [];

        const outBounds = new DataBounds();
        const trimmedBounds = new DataBounds();

        for (let i = 0; i < data.length; i ++) {
            const input = data[i];
		    const current = t.apply(input);

            if (this.reduceXRange) {
                if (current.x < limitRight && (i + 1) < data.length) {
                    const next = t.apply(data[i + 1]);

                    if (next.x < limitLeft) {
                        continue;
                    }
                }

                if (current.x > limitRight && i > 0) {
                    const prev = t.apply(data[i - 1]);

                    if (prev.x > limitRight) {
                        break;
                    }
                }
            }

            outBounds.grown(current);
            trimmedBounds.grown(input);

            output.push(
                current
            );
        }

        if (fitYRange) {
            const {
                fromY, height
            } = chart.range;

            // rescale Y auto ranged
            for (const out of output) {
                out.y = (fromY + (out.y - outBounds.fromY) * height / (outBounds.toY - outBounds.fromY));
            }

            outBounds.toY = fromY + (outBounds.toY - outBounds.fromY);
            outBounds.fromY = fromY;
        }

        result.transform = t;
        result.data = output;
        result.dataBounds = outBounds;
		result.trimmedSourceBounds = trimmedBounds;

		return result;
	}
}

const barVert = `
attribute vec4 aRect;
attribute vec2 aQuad;
attribute vec4 aColor;
uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform float resolution;
uniform vec4 uColor;
uniform float threshold;

varying vec2 vPos;
varying vec4 vDistance;
varying vec4 vColor;

void main(void){
vec2 p1 = (translationMatrix * vec3(aRect.xy, 1.0)).xy;
vec2 p2 = (translationMatrix * vec3(aRect.xy + aRect.zw, 1.0)).xy;
vec2 size = p2 - p1;

vec2 tQuad = (aQuad * 2.0 - 1.0) * threshold;
vec2 tWorld = tQuad;
if (size.x < 0.0) {
    tWorld.x = -tWorld.x;
}
if (size.y < 0.0) {
    tWorld.y = -tWorld.y;
}

vec2 localPos = (translationMatrix * vec3(aRect.zw * aQuad, 0.0)).xy;
vec2 cssPos = (p1 + localPos) + tWorld / resolution;
vDistance.xy = abs(localPos) * resolution + tQuad;
vDistance.zw = aRect.zw * resolution;
gl_Position = vec4((projectionMatrix * vec3(cssPos, 1.0)).xy, 0.0, 1.0);
vColor = aColor * uColor;
}`;
const barFrag = `
varying vec2 vPos;
varying vec4 vDistance;
varying vec4 vColor;

void main(void) {
vec2 leftTop = max(vDistance.xy - 0.5, 0.0);
vec2 rightBottom = min(vDistance.xy + 0.5, vDistance.zw);
vec2 area = max(rightBottom - leftTop, 0.0);
float clip = area.x * area.y;

gl_FragColor = vColor * clip;
}`;

class BarsShader extends MeshMaterial {
    static __initStatic() {this._prog = null;}

    static getProgram() {
        if (!BarsShader._prog) {
            BarsShader._prog = new Program(barVert, barFrag);
        }
        return BarsShader._prog;
    }

    constructor() {
        super(Texture.WHITE, {
            uniforms: {
                resolution: 1,
                threshold: 1,
            },
            program: BarsShader.getProgram()
        });
    }
} BarsShader.__initStatic();

var JOINT_TYPE; (function (JOINT_TYPE) {
    const NONE = 0; JOINT_TYPE[JOINT_TYPE["NONE"] = NONE] = "NONE";
    const FILL = 1; JOINT_TYPE[JOINT_TYPE["FILL"] = FILL] = "FILL";
    const JOINT_BEVEL = 4; JOINT_TYPE[JOINT_TYPE["JOINT_BEVEL"] = JOINT_BEVEL] = "JOINT_BEVEL";
    const JOINT_MITER = 8; JOINT_TYPE[JOINT_TYPE["JOINT_MITER"] = JOINT_MITER] = "JOINT_MITER";
    const JOINT_ROUND = 12; JOINT_TYPE[JOINT_TYPE["JOINT_ROUND"] = JOINT_ROUND] = "JOINT_ROUND";
    const JOINT_CAP_BUTT = 16; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_BUTT"] = JOINT_CAP_BUTT] = "JOINT_CAP_BUTT";
    const JOINT_CAP_SQUARE = 18; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_SQUARE"] = JOINT_CAP_SQUARE] = "JOINT_CAP_SQUARE";
    const JOINT_CAP_ROUND = 20; JOINT_TYPE[JOINT_TYPE["JOINT_CAP_ROUND"] = JOINT_CAP_ROUND] = "JOINT_CAP_ROUND";
    const FILL_EXPAND = 24; JOINT_TYPE[JOINT_TYPE["FILL_EXPAND"] = FILL_EXPAND] = "FILL_EXPAND";
    const CAP_BUTT = 1 << 5; JOINT_TYPE[JOINT_TYPE["CAP_BUTT"] = CAP_BUTT] = "CAP_BUTT";
    const CAP_SQUARE = 2 << 5; JOINT_TYPE[JOINT_TYPE["CAP_SQUARE"] = CAP_SQUARE] = "CAP_SQUARE";
    const CAP_ROUND = 3 << 5; JOINT_TYPE[JOINT_TYPE["CAP_ROUND"] = CAP_ROUND] = "CAP_ROUND";
    const CAP_BUTT2 = 4 << 5; JOINT_TYPE[JOINT_TYPE["CAP_BUTT2"] = CAP_BUTT2] = "CAP_BUTT2";
})(JOINT_TYPE || (JOINT_TYPE = {}));

var LINE_SCALE_MODE; (function (LINE_SCALE_MODE) {
    const NONE = 'none'; LINE_SCALE_MODE["NONE"] = NONE;
    const NORMAL = 'normal'; LINE_SCALE_MODE["NORMAL"] = NORMAL;
    const HORIZONTAL = 'horizontal'; LINE_SCALE_MODE["HORIZONTAL"] = HORIZONTAL;
    const VERTICAL = 'vertical'; LINE_SCALE_MODE["VERTICAL"] = VERTICAL;
})(LINE_SCALE_MODE || (LINE_SCALE_MODE = {}));

const plotVert = `precision highp float;
const float FILL = 1.0;
const float BEVEL = 4.0;
const float MITER = 8.0;
const float ROUND = 12.0;
const float JOINT_CAP_BUTT = 16.0;
const float JOINT_CAP_SQUARE = 18.0;
const float JOINT_CAP_ROUND = 20.0;

const float FILL_EXPAND = 24.0;

const float CAP_BUTT = 1.0;
const float CAP_SQUARE = 2.0;
const float CAP_ROUND = 3.0;
const float CAP_BUTT2 = 4.0;

// === geom ===
attribute vec2 aPrev;
attribute vec2 aPoint1;
attribute vec2 aPoint2;
attribute vec2 aNext;
attribute float aVertexJoint;
attribute float vertexNum;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;

varying vec4 vDistance;
varying vec4 vArc;
varying float vType;

uniform float resolution;
uniform float expand;
uniform float miterLimit;
uniform float scaleMode;
uniform vec2 styleLine;

vec2 doBisect(vec2 norm, float len, vec2 norm2, float len2,
    float dy, float inner) {
    vec2 bisect = (norm + norm2) / 2.0;
    bisect /= dot(norm, bisect);
    vec2 shift = dy * bisect;
    if (inner > 0.5) {
        if (len < len2) {
            if (abs(dy * (bisect.x * norm.y - bisect.y * norm.x)) > len) {
                return dy * norm;
            }
        } else {
            if (abs(dy * (bisect.x * norm2.y - bisect.y * norm2.x)) > len2) {
                return dy * norm;
            }
        }
    }
    return dy * bisect;
}

void main(void){
    vec2 pointA = (translationMatrix * vec3(aPoint1, 1.0)).xy;
    vec2 pointB = (translationMatrix * vec3(aPoint2, 1.0)).xy;

    vec2 xBasis = pointB - pointA;
    float len = length(xBasis);
    vec2 forward = xBasis / len;
    vec2 norm = vec2(forward.y, -forward.x);

    float type = aVertexJoint;

    float lineWidth = styleLine.x;
    if (scaleMode > 2.5) {
        lineWidth *= length(translationMatrix * vec3(1.0, 0.0, 0.0));
    } else if (scaleMode > 1.5) {
        lineWidth *= length(translationMatrix * vec3(0.0, 1.0, 0.0));
    } else if (scaleMode > 0.5) {
        vec2 avgDiag = (translationMatrix * vec3(1.0, 1.0, 0.0)).xy;
        lineWidth *= sqrt(dot(avgDiag, avgDiag) * 0.5);
    }
    float capType = floor(type / 32.0);
    type -= capType * 32.0;
    vArc = vec4(0.0);
    lineWidth *= 0.5;
    float lineAlignment = 2.0 * styleLine.y - 1.0;

    vec2 pos;

    if (capType == CAP_ROUND) {
        if (vertexNum < 3.5) {
            gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
            return;
        }
        type = JOINT_CAP_ROUND;
        capType = 0.0;
    }

    if (type >= BEVEL) {
        float dy = lineWidth + expand;
        float inner = 0.0;
        if (vertexNum >= 1.5) {
            dy = -dy;
            inner = 1.0;
        }

        vec2 base, next, xBasis2, bisect;
        float flag = 0.0;
        float sign2 = 1.0;
        if (vertexNum < 0.5 || vertexNum > 2.5 && vertexNum < 3.5) {
            next = (translationMatrix * vec3(aPrev, 1.0)).xy;
            base = pointA;
            flag = type - floor(type / 2.0) * 2.0;
            sign2 = -1.0;
        } else {
            next = (translationMatrix * vec3(aNext, 1.0)).xy;
            base = pointB;
            if (type >= MITER && type < MITER + 3.5) {
                flag = step(MITER + 1.5, type);
                // check miter limit here?
            }
        }
        xBasis2 = next - base;
        float len2 = length(xBasis2);
        vec2 norm2 = vec2(xBasis2.y, -xBasis2.x) / len2;
        float D = norm.x * norm2.y - norm.y * norm2.x;
        if (D < 0.0) {
            inner = 1.0 - inner;
        }

        norm2 *= sign2;

        if (abs(lineAlignment) > 0.01) {
            float shift = lineWidth * lineAlignment;
            pointA += norm * shift;
            pointB += norm * shift;
            if (abs(D) < 0.01) {
                base += norm * shift;
            } else {
                base += doBisect(norm, len, norm2, len2, shift, 0.0);
            }
        }

        float collinear = step(0.0, dot(norm, norm2));

        vType = 0.0;
        float dy2 = -1000.0;
        float dy3 = -1000.0;

        if (abs(D) < 0.01 && collinear < 0.5) {
            if (type >= ROUND && type < ROUND + 1.5) {
                type = JOINT_CAP_ROUND;
            }
            //TODO: BUTT here too
        }

        if (vertexNum < 3.5) {
            if (abs(D) < 0.01) {
                pos = dy * norm;
            } else {
                if (flag < 0.5 && inner < 0.5) {
                    pos = dy * norm;
                } else {
                    pos = doBisect(norm, len, norm2, len2, dy, inner);
                }
            }
            if (capType >= CAP_BUTT && capType < CAP_ROUND) {
                float extra = step(CAP_SQUARE, capType) * lineWidth;
                vec2 back = -forward;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    pos += back * (expand + extra);
                    dy2 = expand;
                } else {
                    dy2 = dot(pos + base - pointA, back) - extra;
                }
            }
            if (type >= JOINT_CAP_BUTT && type < JOINT_CAP_SQUARE + 0.5) {
                float extra = step(JOINT_CAP_SQUARE, type) * lineWidth;
                if (vertexNum < 0.5 || vertexNum > 2.5) {
                    dy3 = dot(pos + base - pointB, forward) - extra;
                } else {
                    pos += forward * (expand + extra);
                    dy3 = expand;
                    if (capType >= CAP_BUTT) {
                        dy2 -= expand + extra;
                    }
                }
            }
        } else if (type >= JOINT_CAP_ROUND && type < JOINT_CAP_ROUND + 1.5) {
            if (inner > 0.5) {
                dy = -dy;
                inner = 0.0;
            }
            vec2 d2 = abs(dy) * forward;
            if (vertexNum < 4.5) {
                dy = -dy;
                pos = dy * norm;
            } else if (vertexNum < 5.5) {
                pos = dy * norm;
            } else if (vertexNum < 6.5) {
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            } else {
                dy = -dy;
                pos = dy * norm + d2;
                vArc.x = abs(dy);
            }
            dy2 = 0.0;
            vArc.y = dy;
            vArc.z = 0.0;
            vArc.w = lineWidth;
            vType = 3.0;
        } else if (abs(D) < 0.01) {
            pos = dy * norm;
        } else {
            if (type >= ROUND && type < ROUND + 1.5) {
                if (inner > 0.5) {
                    dy = -dy;
                    inner = 0.0;
                }
                if (vertexNum < 4.5) {
                    pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
                } else if (vertexNum < 5.5) {
                    pos = dy * norm;
                } else if (vertexNum > 7.5) {
                    pos = dy * norm2;
                } else {
                    pos = doBisect(norm, len, norm2, len2, dy, 0.0);
                    float d2 = abs(dy);
                    if (length(pos) > abs(dy) * 1.5) {
                        if (vertexNum < 6.5) {
                            pos.x = dy * norm.x - d2 * norm.y;
                            pos.y = dy * norm.y + d2 * norm.x;
                        } else {
                            pos.x = dy * norm2.x + d2 * norm2.y;
                            pos.y = dy * norm2.y - d2 * norm2.x;
                        }
                    }
                }
                vec2 norm3 = normalize(norm + norm2);

                float sign = step(0.0, dy) * 2.0 - 1.0;
                vArc.x = sign * dot(pos, norm3);
                vArc.y = pos.x * norm3.y - pos.y * norm3.x;
                vArc.z = dot(norm, norm3) * lineWidth;
                vArc.w = lineWidth;

                dy = -sign * dot(pos, norm);
                dy2 = -sign * dot(pos, norm2);
                dy3 = vArc.z - vArc.x;
                vType = 3.0;
            } else {
                float hit = 0.0;
                if (type >= BEVEL && type < BEVEL + 1.5) {
                    if (dot(norm, norm2) > 0.0) {
                        type = MITER;
                    }
                }

                if (type >= MITER && type < MITER + 3.5) {
                    if (inner > 0.5) {
                        dy = -dy;
                        inner = 0.0;
                    }
                    float sign = step(0.0, dy) * 2.0 - 1.0;
                    pos = doBisect(norm, len, norm2, len2, dy, 0.0);
                    if (length(pos) > abs(dy) * miterLimit) {
                        type = BEVEL;
                    } else {
                        if (vertexNum < 4.5) {
                            dy = -dy;
                            pos = doBisect(norm, len, norm2, len2, dy, 1.0);
                        } else if (vertexNum < 5.5) {
                            pos = dy * norm;
                        } else if (vertexNum > 6.5) {
                            pos = dy * norm2;
                        }
                        vType = 1.0;
                        dy = -sign * dot(pos, norm);
                        dy2 = -sign * dot(pos, norm2);
                        hit = 1.0;
                    }
                }
                if (type >= BEVEL && type < BEVEL + 1.5) {
                    if (inner > 0.5) {
                        dy = -dy;
                        inner = 0.0;
                    }
                    float d2 = abs(dy);
                    vec2 pos3 = vec2(dy * norm.x - d2 * norm.y, dy * norm.y + d2 * norm.x);
                    vec2 pos4 = vec2(dy * norm2.x + d2 * norm2.y, dy * norm2.y - d2 * norm2.x);
                    if (vertexNum < 4.5) {
                        pos = doBisect(norm, len, norm2, len2, -dy, 1.0);
                    } else if (vertexNum < 5.5) {
                        pos = dy * norm;
                    } else if (vertexNum > 7.5) {
                        pos = dy * norm2;
                    } else {
                        if (vertexNum < 6.5) {
                            pos = pos3;
                        } else {
                            pos = pos4;
                        }
                    }
                    vec2 norm3 = normalize(norm + norm2);
                    float sign = step(0.0, dy) * 2.0 - 1.0;

                    dy = -sign * dot(pos, norm);
                    dy2 = -sign * dot(pos, norm2);
                    dy3 = (-sign * dot(pos, norm3)) + lineWidth;
                    vType = 4.0;
                    hit = 1.0;
                }
                if (hit < 0.5) {
                    gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
                    return;
                }
            }
        }

        pos += base;
        vDistance = vec4(dy, dy2, dy3, lineWidth) * resolution;
        vArc = vArc * resolution;
    }

    gl_Position = vec4((projectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);
}`;

const plotFrag = `precision highp float;
varying vec4 vDistance;
varying vec4 vArc;
varying float vType;
uniform vec4 uColor;

void main(void){
    float alpha = 1.0;
    float lineWidth = vDistance.w;
    if (vType < 0.5) {
        float left = max(vDistance.x - 0.5, -vDistance.w);
        float right = min(vDistance.x + 0.5, vDistance.w);
        float near = vDistance.y - 0.5;
        float far = min(vDistance.y + 0.5, 0.0);
        float top = vDistance.z - 0.5;
        float bottom = min(vDistance.z + 0.5, 0.0);
        alpha = max(right - left, 0.0) * max(bottom - top, 0.0) * max(far - near, 0.0);
    } else if (vType < 1.5) {
        float a1 = clamp(vDistance.x + 0.5 - lineWidth, 0.0, 1.0);
        float a2 = clamp(vDistance.x + 0.5 + lineWidth, 0.0, 1.0);
        float b1 = clamp(vDistance.y + 0.5 - lineWidth, 0.0, 1.0);
        float b2 = clamp(vDistance.y + 0.5 + lineWidth, 0.0, 1.0);
        alpha = a2 * b2 - a1 * b1;
    } else if (vType < 2.5) {
        alpha *= max(min(vDistance.x + 0.5, 1.0), 0.0);
        alpha *= max(min(vDistance.y + 0.5, 1.0), 0.0);
        alpha *= max(min(vDistance.z + 0.5, 1.0), 0.0);
    } else if (vType < 3.5) {
        float a1 = clamp(vDistance.x + 0.5 - lineWidth, 0.0, 1.0);
        float a2 = clamp(vDistance.x + 0.5 + lineWidth, 0.0, 1.0);
        float b1 = clamp(vDistance.y + 0.5 - lineWidth, 0.0, 1.0);
        float b2 = clamp(vDistance.y + 0.5 + lineWidth, 0.0, 1.0);
        float alpha_miter = a2 * b2 - a1 * b1;

        float alpha_plane = max(min(vDistance.z + 0.5, 1.0), 0.0);

        float d = length(vArc.xy);
        float circle_hor = max(min(vArc.w, d + 0.5) - max(-vArc.w, d - 0.5), 0.0);
        float circle_vert = min(vArc.w * 2.0, 1.0);
        float alpha_circle = circle_hor * circle_vert;

        alpha = min(alpha_miter, max(alpha_circle, alpha_plane));
    } else {
        float a1 = clamp(vDistance.x + 0.5 - lineWidth, 0.0, 1.0);
        float a2 = clamp(vDistance.x + 0.5 + lineWidth, 0.0, 1.0);
        float b1 = clamp(vDistance.y + 0.5 - lineWidth, 0.0, 1.0);
        float b2 = clamp(vDistance.y + 0.5 + lineWidth, 0.0, 1.0);
        alpha = a2 * b2 - a1 * b1;
        alpha *= max(min(vDistance.z + 0.5, 1.0), 0.0);
    }
    gl_FragColor = uColor * alpha;
}
`;

class PlotShader extends MeshMaterial {
    static __initStatic() {this._prog = null;}

    static getProgram() {
        if (!PlotShader._prog) {
            PlotShader._prog = new Program(plotVert, plotFrag);
        }
        return PlotShader._prog;
    }

    constructor() {
        super(Texture.WHITE, {
            uniforms: {
                resolution: 1,
                expand: 1,
                scaleMode: 1,
                styleLine: new Float32Array([1.0, 0.5]),
                miterLimit: 5.0,
            },
            program: PlotShader.getProgram()
        });
    }
} PlotShader.__initStatic();

function multIndex(indices, vertCount, instanceCount, support32 = true) {
    const size = indices.length;
    const ind = support32 ? new Uint32Array(size * instanceCount) : new Uint16Array(size * instanceCount);
    for (let i = 0; i < instanceCount; i++) {
        for (let j = 0; j < size; j++) {
            ind[i * size + j] = indices[j] + vertCount * i;
        }
    }
    return ind;
}

class PlotGeometry extends Geometry {
    constructor(_static = false) {
        super();PlotGeometry.prototype.__init.call(this);PlotGeometry.prototype.__init2.call(this);PlotGeometry.prototype.__init3.call(this);PlotGeometry.prototype.__init4.call(this);PlotGeometry.prototype.__init5.call(this);PlotGeometry.prototype.__init6.call(this);PlotGeometry.prototype.__init7.call(this);PlotGeometry.prototype.__init8.call(this);PlotGeometry.prototype.__init9.call(this);PlotGeometry.prototype.__init10.call(this);PlotGeometry.prototype.__init11.call(this);PlotGeometry.prototype.__init12.call(this);PlotGeometry.prototype.__init13.call(this);PlotGeometry.prototype.__init14.call(this);PlotGeometry.prototype.__init15.call(this);PlotGeometry.prototype.__init16.call(this);PlotGeometry.prototype.__init17.call(this);PlotGeometry.prototype.__init18.call(this);PlotGeometry.prototype.__init19.call(this);        this.initGeom(_static);
        this.reset();
    }

    __init() {this.joinStyle = LINE_JOIN.MITER;}
    __init2() {this.capStyle = LINE_CAP.SQUARE;}

    __init3() {this.lastLen = 0;}
    __init4() {this.lastPointNum = 0;}
    __init5() {this.lastPointData = 0;}
    __init6() {this.updateId = 0;}
    __init7() {this.points = [];}
    __init8() {this._floatView = null;}
    __init9() {this._u32View = null;}
    __init10() {this._buffer = null;}
    __init11() {this._quad = null;}
    __init12() {this._indexBuffer = null;}
    __init13() {this._vertexNums = null;}
    __init14() {this.support32 = false;}

    initGeom(_static) {
        this._buffer = new Buffer(new Float32Array(0), _static, false);

        this._vertexNums = new Buffer(new Float32Array([0, 1, 2, 3, 4, 5, 6, 7, 8]), true, false);

        this._indexBuffer = new Buffer(new Uint16Array([0, 1, 2, 0, 2, 3, 4, 5, 6, 4, 6, 7, 4, 7, 8]), true, true);

        this.addAttribute('aPrev', this._buffer, 2, false, TYPES$1.FLOAT, 3 * 4, 0 * 4, true)
            .addAttribute('aPoint1', this._buffer, 2, false, TYPES$1.FLOAT, 3 * 4, 3 * 4, true)
            .addAttribute('aPoint2', this._buffer, 2, false, TYPES$1.FLOAT, 3 * 4, 6 * 4, true)
            .addAttribute('aNext', this._buffer, 2, false, TYPES$1.FLOAT, 3 * 4, 9 * 4, true)
            .addAttribute('aVertexJoint', this._buffer, 1, false, TYPES$1.FLOAT, 3 * 4, 5 * 4, true)
            .addAttribute('vertexNum', this._vertexNums, 1, false, TYPES$1.FLOAT)
            .addIndex(this._indexBuffer);
    }

    __init15() {this.stridePoints = 2;}
    __init16() {this.strideFloats = 3;}
    __init17() {this.strideBytes = 3 * 4;}

    moveTo(x, y) {
        const {points} = this;
        points.push(x);
        points.push(y);
    }

    lineTo(x, y) {
        const {points} = this;
        points.push(x);
        points.push(y);
    }


    lineBy(dx, dy) {
        const {points, stridePoints} = this;

        const x = points[points.length - stridePoints];
        const y = points[points.length - stridePoints + 1];

        points.push(x + dx);
        points.push(y + dy);
    }

    invalidate(pointNum = 0) {
        this.lastPointNum = Math.min(pointNum, this.lastPointNum);
        this.updateId++;
    }

    reset() {
        if (this.lastLen > 0) {
            this.clearBufferData();
        }
        this.updateId++;
        this.lastLen = 0;
        this.lastPointData = 0;
        this.points.length = 0;
        this.instanceCount = 0;
    }

    clearBufferData() {
        const {points, strideBytes, stridePoints} = this;
        this.lastPointNum = 0;
        this.lastPointData = 0;
        const arrayLen = Math.max(0, points.length / stridePoints + 3);
        const arrBuf = new ArrayBuffer(strideBytes * arrayLen);
        this.lastLen = points.length;
        this._floatView = new Float32Array(arrBuf);
        this._u32View = new Uint32Array(arrBuf);
        this._buffer.update(arrBuf);
    }

    updateBuffer() {
        const {points, stridePoints, strideFloats} = this;

        if (this.lastLen > points.length) {
            this.lastLen = -1;
        }
        if (this.lastLen < points.length
            || this.lastPointNum < this.lastLen) { // TODO: partial upload
            this.clearBufferData();
        }

        if (this.lastPointNum == this.lastLen) {
            return;
        }

        const jointType = this.jointType();
        const capType = this.capType();
        let endJoint = capType;
        if (capType === JOINT_TYPE.CAP_ROUND) {
            endJoint = JOINT_TYPE.JOINT_CAP_ROUND;
        }
        if (capType === JOINT_TYPE.CAP_BUTT) {
            endJoint = JOINT_TYPE.JOINT_CAP_BUTT;
        }
        if (capType === JOINT_TYPE.CAP_SQUARE) {
            endJoint = JOINT_TYPE.JOINT_CAP_SQUARE;
        }

        const {_floatView, _u32View} = this;

        if (this.lastPointNum > 0) {
            this.lastPointNum--;
        }
        if (this.lastPointNum > 0) {
            this.lastPointNum--;
        }

        this.lastPointData = Math.min(this.lastPointData, this.lastPointNum);
        let j = (Math.round(this.lastPointNum / stridePoints) + 2) * strideFloats; //actually that's int division

        for (let i = this.lastPointNum; i < points.length; i += stridePoints) {
            _floatView[j++] = points[i];
            _floatView[j++] = points[i + 1];

            if (isNaN(points[i]) || isNaN(points[i + 1])) {
                // find prev non-nan
                _floatView[j-2] = (points[i+2] + points[i-2]) * 0.5;
                _floatView[j-1] = (points[i+3] + points[i-1]) * 0.5;
                _floatView[j] = 0;
                j++;
                continue;
            }

            _floatView[j] = jointType;
            if (i == 0) {
                if (capType !== JOINT_TYPE.CAP_ROUND) {
                    _floatView[j] += capType;
                }
            } else {
                if (isNaN(points[i - 2]) || isNaN(points[i - 1])) {
                    _floatView[j] += JOINT_TYPE.CAP_BUTT;
                }
            }
            if (i + stridePoints * 2 >= points.length || isNaN(points[i + 4]) || isNaN(points[i + 5])) {
                _floatView[j] += endJoint - jointType;
            } else if (i + stridePoints >= points.length || isNaN(points[i + 2]) || isNaN(points[i + 3])) {
                _floatView[j] = 0;
            }
            j++;
        }
        _floatView[j++] = points[points.length - 4];
        _floatView[j++] = points[points.length - 3];
        _floatView[j++] = 0;
        _floatView[0] = points[0];
        _floatView[1] = points[1];
        _floatView[2] = 0;
        _floatView[3] = points[2];
        _floatView[4] = points[3];
        _floatView[5] = capType === JOINT_TYPE.CAP_ROUND ? capType : 0;

        //TODO: update from first modified float
        this._buffer.update();
        this.instanceCount = Math.round(points.length / stridePoints);

        this.lastPointNum = this.lastLen;
        this.lastPointData = this.lastLen; // TODO: partial upload

        if (this.legacyGeom) {
            this.updateLegacy();
        }
    }

    __init18() {this.legacyGeom = null;}
    __init19() {this.legacyBuffer = null;}

    initLegacy(support32) {
        if (this.legacyGeom) {
            return;
        }
        const ind = [0, 1, 2, 0, 2, 3];
        this.support32 = support32;
        this.legacyGeom = new Geometry();
        this.legacyBuffer = new Buffer(new Float32Array(0), false, false);
        this.legacyGeom.addAttribute('aPrev', this.legacyBuffer, 2, false, TYPES$1.FLOAT)
            .addAttribute('aPoint1', this.legacyBuffer, 2, false, TYPES$1.FLOAT)
            .addAttribute('aPoint2', this.legacyBuffer, 2, false, TYPES$1.FLOAT)
            .addAttribute('aNext', this.legacyBuffer, 2, false, TYPES$1.FLOAT)
            .addAttribute('aVertexJoint', this.legacyBuffer, 1, false, TYPES$1.FLOAT)
            .addAttribute('vertexNum', this.legacyBuffer, 1, false, TYPES$1.FLOAT)
            .addIndex(new Buffer(support32? new Uint32Array(ind): new Uint16Array(ind), false, true));
    }

    updateLegacy() {
        const {legacyBuffer, _floatView, _u32View, strideFloats} = this;
        const strideLegacy = 10;
        const vcount = 9;
        const instanceCount = (this._floatView.length / strideFloats - 3);
        const legacyLen = instanceCount * strideLegacy * vcount;
        if ((legacyBuffer.data ).length !== legacyLen) {
            legacyBuffer.data = new Float32Array(legacyLen);
            this.legacyGeom.getIndex().update(multIndex(this._indexBuffer.data , vcount, instanceCount, this.support32));
        }
        const floats = legacyBuffer.data ;
        for (let i = 0, j = 0; j < legacyLen; i += strideFloats) {
            for (let k = 0; k < vcount; k++) {
                floats[j++] = _floatView[i];
                floats[j++] = _floatView[i + 1];
                floats[j++] = _floatView[i + 3];
                floats[j++] = _floatView[i + 4];
                floats[j++] = _floatView[i + 6];
                floats[j++] = _floatView[i + 7];
                floats[j++] = _floatView[i + 9];
                floats[j++] = _floatView[i + 10];
                floats[j++] = _floatView[i + 5];
                floats[j++] = k;
            }
        }
    }

    /**
     * copied from graphics-smooth
     */
     capType() {
        let cap;

        switch (this.capStyle) {
            case LINE_CAP.SQUARE:
                cap = JOINT_TYPE.CAP_SQUARE;
                break;
            case LINE_CAP.ROUND:
                cap = JOINT_TYPE.CAP_ROUND;
                break;
            default:
                cap = JOINT_TYPE.CAP_BUTT;
                break;
        }

        return cap;
    }

    /**
     * copied from graphics-smooth
     */
     goodJointType() {
        let joint;

        switch (this.joinStyle) {
            case LINE_JOIN.BEVEL:
                joint = JOINT_TYPE.JOINT_BEVEL;
                break;
            case LINE_JOIN.ROUND:
                joint = JOINT_TYPE.JOINT_ROUND;
                break;
            default:
                joint = JOINT_TYPE.JOINT_MITER + 3;
                break;
        }

        return joint;
    }

    /**
     * copied from graphics-smooth
     */
     jointType() {
        let joint;

        switch (this.joinStyle) {
            case LINE_JOIN.BEVEL:
                joint = JOINT_TYPE.JOINT_BEVEL;
                break;
            case LINE_JOIN.ROUND:
                joint = JOINT_TYPE.JOINT_ROUND;
                break;
            default:
                joint = JOINT_TYPE.JOINT_MITER;
                break;
        }

        return joint;
    }
}



















class Plot extends Mesh {
    constructor(options) {
        const geometry = new PlotGeometry();
        const shader = new PlotShader();
        let scaleMode = LINE_SCALE_MODE.NORMAL;
        if (options) {
            if (options.lineWidth !== undefined) {
                shader.uniforms.styleLine[0] = options.lineWidth;
            }
            if (options.nativeLineWidth !== undefined) {
                shader.uniforms.styleLine[0] = options.nativeLineWidth;
                scaleMode = LINE_SCALE_MODE.NONE;
            }
            if (options.joinStyle !== undefined) {
                geometry.joinStyle = options.joinStyle;
            }
            if (options.capStyle !== undefined) {
                geometry.capStyle = options.capStyle;
            }
        }

        super(geometry, shader);
        this.scaleMode = scaleMode;
    }

    moveTo(x, y) {
        const geometry = this.geometry ;
        geometry.moveTo(x, y);
    }

    lineTo(x, y) {
        const geometry = this.geometry ;
        geometry.lineTo(x, y);
    }

    lineBy(x, y) {
        const geometry = this.geometry ;
        geometry.lineBy(x, y);
    }

    lineStyle(width, nativeWidth, joinStyle, capStyle) {
        const param = width ;
        if (param instanceof Object) {
            this.gLineStyle(param);
            return;
        }

        const geometry = this.geometry ;
        if (width !== undefined) {
            this.shader.uniforms.styleLine[0] = width;
            this.scaleMode = LINE_SCALE_MODE.NORMAL;
        }
        if (nativeWidth !== undefined) {
            this.shader.uniforms.styleLine[0] = nativeWidth;
            this.scaleMode = LINE_SCALE_MODE.NONE;
        }
        if (joinStyle !== undefined) {
            geometry.joinStyle = joinStyle;
        }
        if (capStyle !== undefined) {
            geometry.capStyle = capStyle;
        }
        geometry.invalidate();
    }

    gLineStyle(obj) {
        const geometry = this.geometry ;
        if (obj.width !== undefined) {
            this.shader.uniforms.styleLine[0] = obj.width;
        }
        if (obj.alignment !== undefined) {
            this.shader.uniforms.styleLine[0] = obj.alignment;
        }
        if (obj.scaleMode !== undefined) {
            this.shader.uniforms.scaleMode = obj.scaleMode;
        }
        if (obj.color !== undefined) {
            this.tint = obj.color;
        }
        if (obj.join !== undefined) {
            geometry.joinStyle = obj.join;
        }
        if (obj.cap !== undefined) {
            geometry.capStyle = obj.cap;
        }
    }

    set scaleMode(value) {
        this._scaleMode = value;
        let intVal = 0;
        switch (value) {
            case LINE_SCALE_MODE.NORMAL: intVal = 1; break;
            case LINE_SCALE_MODE.HORIZONTAL: intVal = 2; break;
            case LINE_SCALE_MODE.VERTICAL: intVal = 3; break;
        }
        this.shader.uniforms.scaleMode = intVal;
    }

    get scaleMode() {
        return this._scaleMode
    }

    

    clear() {
        (this.geometry ).reset();
    }

    _renderDefault(renderer) {
        const geometry = this.geometry ;

        if (geometry.points.length < 4) {
            return;
        }

        const useLegacy = !renderer.geometry.hasInstance;
        if (useLegacy) {
            geometry.initLegacy(renderer.context.supports.uint32Indices);
        }
        geometry.updateBuffer();
        if (geometry.instanceCount === 0) {
            return;
        }
        const rt = renderer.renderTexture.current;
        const multisample = rt ? rt.framebuffer.multisample > 1 : renderer.options.antialias;
        const resolution = this.shader.uniforms.resolution = (rt ? rt.baseTexture.resolution : renderer.resolution);
        this.shader.uniforms.expand = (multisample ? 2 : 1) / resolution;

        if (useLegacy) {
            // hacky!
            (this ).geometry = geometry.legacyGeom;
            super._renderDefault(renderer);
            (this ).geometry = geometry;
            return;
        }
        super._renderDefault(renderer);
    }

    _renderCanvas(renderer) {
        const {points, stridePoints, capStyle, joinStyle} = this.geometry ;
        const {context} = renderer;
        const len = points.length;
        if (len < 2) {
            return;
        }
        const wt = this.transform.worldTransform;
        renderer.setContextTransform(wt);

        const scale = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
        context.lineWidth = this.shader.uniforms.styleLine[0] + this.shader.uniforms.styleLine[1] / scale;

        context.strokeStyle = hex2string(this.tint);
        context.globalAlpha = this.worldAlpha;
        context.lineCap = capStyle;
        context.lineJoin = joinStyle;

        context.beginPath();
        context.moveTo(points[0], points[1]);
        for (let i = 2; i < points.length; i += stridePoints) {
            context.lineTo(points[i], points[i + 1]);
        }
        context.stroke();
        context.beginPath();

        context.globalAlpha = 1.0;
    }
}

const gradVert = `
attribute vec2 aVertexPosition;

uniform mat3 projectionMatrix;
uniform mat3 translationMatrix;
uniform vec2 rangeY;

varying float vOrdinate;

void main(void)
{
vec2 pos = (translationMatrix * vec3(aVertexPosition, 1.0)).xy;
if (pos.y > rangeY.y) {
    pos.y = rangeY.y;
}
gl_Position = vec4((projectionMatrix * vec3(pos, 1.0)).xy, 0.0, 1.0);
vOrdinate = pos.y;
}`;
const gradFrag = `
varying float vOrdinate;

uniform vec4 colorTop;
uniform vec4 colorBottom;
uniform vec4 uColor;
uniform vec2 rangeY2;

void main(void)
{
vec4 color = colorTop;
if (vOrdinate > rangeY2.x) {
    if (vOrdinate >= rangeY2.y) {
        color = colorBottom;
    } else {
        color = colorTop + (colorBottom - colorTop) * (vOrdinate - rangeY2.x) / (rangeY2.y - rangeY2.x);
    }
}

color.rgb *= color.a;
gl_FragColor = color * uColor;
}
`;

class PlotGradientShader extends MeshMaterial {
    static __initStatic() {this._prog = null;}

    static getProgram() {
        if (!PlotGradientShader._prog) {
            PlotGradientShader._prog = new Program(gradVert, gradFrag);
        }
        return PlotGradientShader._prog;
    }

    constructor() {
        const rangeY = new Float32Array(2);
        super(Texture.WHITE, {
            uniforms: {
                resolution: 1,
                colorTop: new Float32Array([1, 1, 1, 1]),
                colorBottom: new Float32Array([1, 1, 1, 1]),
                rangeY: rangeY,
                rangeY2: rangeY,
            },
            program: PlotGradientShader.getProgram()
        });
    }
} PlotGradientShader.__initStatic();

class PlotGradientGeometry extends Geometry {
    constructor(_static = false) {
        super();PlotGradientGeometry.prototype.__init.call(this);PlotGradientGeometry.prototype.__init2.call(this);PlotGradientGeometry.prototype.__init3.call(this);PlotGradientGeometry.prototype.__init4.call(this);PlotGradientGeometry.prototype.__init5.call(this);PlotGradientGeometry.prototype.__init6.call(this);PlotGradientGeometry.prototype.__init7.call(this);PlotGradientGeometry.prototype.__init8.call(this);PlotGradientGeometry.prototype.__init9.call(this);        this.initGeom(_static);
        this.reset();
    }

    __init() {this.lastLen = 0;}
    __init2() {this.lastPointNum = 0;}
    __init3() {this.lastPointData = 0;}
    __init4() {this.points = [];}
    __init5() {this._floatView = null;}
    __init6() {this._buffer = null;}

    initGeom(_static) {
        this._buffer = new Buffer(new Float32Array(0), _static, false);

        this.addAttribute('aVertexPosition', this._buffer, 2, false, TYPES$1.FLOAT);
    }

    __init7() {this.stridePoints = 2;}
    __init8() {this.strideFloats = 2 * 6;}
    __init9() {this.strideBytes = 8 * 6;}

    moveTo(x, y) {
        const {points} = this;
        points.push(x);
        points.push(y);
    }

    lineTo(x, y) {
        const {points} = this;
        points.push(x);
        points.push(y);
    }

    invalidate(pointNum = 0) {
        this.lastPointNum = Math.min(pointNum, this.lastPointNum);
    }

    reset() {
        if (this.lastLen > 0) {
            this.clearBufferData();
        }
        this.lastLen = 0;
        this.lastPointData = 0;
        this.points.length = 0;
    }

    clearBufferData() {
        const {points, strideFloats, stridePoints} = this;
        this.lastPointNum = 0;
        this.lastPointData = 0;
        const arrayLen = Math.max(0, points.length / stridePoints - 1);
        this._floatView = new Float32Array(strideFloats * arrayLen);
        this._buffer.update(this._floatView);
        this.lastLen = points.length;
    }

    updateBuffer() {
        const {points, stridePoints, strideFloats} = this;

        if (this.lastLen > points.length) {
            this.lastLen = -1;
        }
        if (this.lastLen < points.length
            || this.lastPointNum < this.lastLen) { // TODO: partial upload
            this.clearBufferData();
        }

        if (this.lastPointNum == this.lastLen) {
            return;
        }

        const {_floatView} = this;
        this.lastPointData = Math.min(this.lastPointData, this.lastPointNum);
        let j = Math.round(this.lastPointNum * strideFloats / stridePoints);
        for (let i = this.lastPointNum; i < points.length - stridePoints; i += stridePoints) {
            const next = i + stridePoints;

            const x = points[i], y = points[i + 1], x2 = points[next], y2 = points[next + 1];

            const bottomLine = 10000.0;

            _floatView[j++] = x;
            _floatView[j++] = y;
            _floatView[j++] = x2;
            _floatView[j++] = y2;
            _floatView[j++] = x2;
            _floatView[j++] = bottomLine;
            _floatView[j++] = x;
            _floatView[j++] = y;
            _floatView[j++] = x2;
            _floatView[j++] = bottomLine;
            _floatView[j++] = x;
            _floatView[j++] = bottomLine;
        }
        this._buffer.update();

        this.lastPointNum = this.lastLen;
        this.lastPointData = this.lastLen; // TODO: partial upload
    }
}

class PlotGradient extends Mesh {
    constructor() {
        super(new PlotGradientGeometry(), new PlotGradientShader());PlotGradient.prototype.__init10.call(this);PlotGradient.prototype.__init11.call(this);    }

    get coordTop() {
        return this.shader.uniforms.rangeY[0];
    }

    set coordTop(value) {
        this.shader.uniforms.rangeY[0] = value;
    }

    get coordBottom() {
        return this.shader.uniforms.rangeY[1];
    }

    set coordBottom(value) {
        this.shader.uniforms.rangeY[1] = value;
    }

    get alphaTop() {
        return this.shader.uniforms.colorTop[3];
    }

    set alphaTop(value) {
        this.shader.uniforms.colorTop[3] = value;
    }

    get alphaBottom() {
        return this.shader.uniforms.colorBottom[3];
    }

    set alphaBottom(value) {
        this.shader.uniforms.colorBottom[3] = value;
    }

    get colorBottom() {
        return rgb2hex(this.shader.uniforms.colorBottom);
    }

    set colorBottom(value) {
        hex2rgb(value, this.shader.uniforms.colorBottom);
    }

    get colorTop() {
        return rgb2hex(this.shader.uniforms.colorTop);
    }

    set colorTop(value) {
        hex2rgb(value, this.shader.uniforms.colorTop);
    }

    __init10() {this.masterPlot = null;}
    __init11() {this.plotUpdateId = -1;}

    clear() {
        if (!this.masterPlot) {
            (this.geometry ).reset();
        }
    }

    moveTo(x, y) {
        this.lineTo(x, y);
    }

    lineTo(x, y) {
        if (!this.masterPlot) {
            (this.geometry ).lineTo(x, y);
        }
    }

    _render(renderer) {
        const geom = this.geometry ;
        if (this.masterPlot) {
            const plotGeom = this.masterPlot.geometry ;
            if (this.plotUpdateId !== plotGeom.updateId) {
                this.plotUpdateId = plotGeom.updateId;
                geom.points = plotGeom.points;
                geom.invalidate();
            }
        }
        geom.updateBuffer();

        this._renderDefault(renderer);
    }

    _renderCanvas(renderer) {
        this.geometry ;
        // let points = geom.points;
        // if (this.masterPlot) {
        //     const plotGeom = this.masterPlot.geometry as PlotGeometry;
        //     if (this.plotUpdateId !== plotGeom.updateId) {
        //         this.plotUpdateId = plotGeom.updateId
        //         geom.points = plotGeom.points;
        //     }
        // }
        //
        //
        // const {points, stridePoints} = this.geometry as BarsGeometry;
        // const {context} = renderer;
        // const len = points.length;
        // if (len < 2) {
        //     return;
        // }
        // const wt = this.transform.worldTransform;
        // renderer.setContextTransform(wt);
        //
        // const scale = Math.sqrt(wt.a * wt.a + wt.b * wt.b);
        // context.lineWidth = this.shader.uniforms.lineWidth[0] + this.shader.uniforms.lineWidth[1] / scale;
        //
        // context.strokeStyle = utils.hex2string(this.tint);
        // context.globalAlpha = this.worldAlpha;
        //
        // context.beginPath();
        // context.moveTo(points[0], points[1]);
        // for (let i = 2; i < points.length; i += stridePoints) {
        //     context.lineTo(points[i], points[i + 1]);
        // }
        // context.stroke();
        // context.beginPath();
        //
        // context.globalAlpha = 1.0;
    }
}

var colorName = {
	"aliceblue": [240, 248, 255],
	"antiquewhite": [250, 235, 215],
	"aqua": [0, 255, 255],
	"aquamarine": [127, 255, 212],
	"azure": [240, 255, 255],
	"beige": [245, 245, 220],
	"bisque": [255, 228, 196],
	"black": [0, 0, 0],
	"blanchedalmond": [255, 235, 205],
	"blue": [0, 0, 255],
	"blueviolet": [138, 43, 226],
	"brown": [165, 42, 42],
	"burlywood": [222, 184, 135],
	"cadetblue": [95, 158, 160],
	"chartreuse": [127, 255, 0],
	"chocolate": [210, 105, 30],
	"coral": [255, 127, 80],
	"cornflowerblue": [100, 149, 237],
	"cornsilk": [255, 248, 220],
	"crimson": [220, 20, 60],
	"cyan": [0, 255, 255],
	"darkblue": [0, 0, 139],
	"darkcyan": [0, 139, 139],
	"darkgoldenrod": [184, 134, 11],
	"darkgray": [169, 169, 169],
	"darkgreen": [0, 100, 0],
	"darkgrey": [169, 169, 169],
	"darkkhaki": [189, 183, 107],
	"darkmagenta": [139, 0, 139],
	"darkolivegreen": [85, 107, 47],
	"darkorange": [255, 140, 0],
	"darkorchid": [153, 50, 204],
	"darkred": [139, 0, 0],
	"darksalmon": [233, 150, 122],
	"darkseagreen": [143, 188, 143],
	"darkslateblue": [72, 61, 139],
	"darkslategray": [47, 79, 79],
	"darkslategrey": [47, 79, 79],
	"darkturquoise": [0, 206, 209],
	"darkviolet": [148, 0, 211],
	"deeppink": [255, 20, 147],
	"deepskyblue": [0, 191, 255],
	"dimgray": [105, 105, 105],
	"dimgrey": [105, 105, 105],
	"dodgerblue": [30, 144, 255],
	"firebrick": [178, 34, 34],
	"floralwhite": [255, 250, 240],
	"forestgreen": [34, 139, 34],
	"fuchsia": [255, 0, 255],
	"gainsboro": [220, 220, 220],
	"ghostwhite": [248, 248, 255],
	"gold": [255, 215, 0],
	"goldenrod": [218, 165, 32],
	"gray": [128, 128, 128],
	"green": [0, 128, 0],
	"greenyellow": [173, 255, 47],
	"grey": [128, 128, 128],
	"honeydew": [240, 255, 240],
	"hotpink": [255, 105, 180],
	"indianred": [205, 92, 92],
	"indigo": [75, 0, 130],
	"ivory": [255, 255, 240],
	"khaki": [240, 230, 140],
	"lavender": [230, 230, 250],
	"lavenderblush": [255, 240, 245],
	"lawngreen": [124, 252, 0],
	"lemonchiffon": [255, 250, 205],
	"lightblue": [173, 216, 230],
	"lightcoral": [240, 128, 128],
	"lightcyan": [224, 255, 255],
	"lightgoldenrodyellow": [250, 250, 210],
	"lightgray": [211, 211, 211],
	"lightgreen": [144, 238, 144],
	"lightgrey": [211, 211, 211],
	"lightpink": [255, 182, 193],
	"lightsalmon": [255, 160, 122],
	"lightseagreen": [32, 178, 170],
	"lightskyblue": [135, 206, 250],
	"lightslategray": [119, 136, 153],
	"lightslategrey": [119, 136, 153],
	"lightsteelblue": [176, 196, 222],
	"lightyellow": [255, 255, 224],
	"lime": [0, 255, 0],
	"limegreen": [50, 205, 50],
	"linen": [250, 240, 230],
	"magenta": [255, 0, 255],
	"maroon": [128, 0, 0],
	"mediumaquamarine": [102, 205, 170],
	"mediumblue": [0, 0, 205],
	"mediumorchid": [186, 85, 211],
	"mediumpurple": [147, 112, 219],
	"mediumseagreen": [60, 179, 113],
	"mediumslateblue": [123, 104, 238],
	"mediumspringgreen": [0, 250, 154],
	"mediumturquoise": [72, 209, 204],
	"mediumvioletred": [199, 21, 133],
	"midnightblue": [25, 25, 112],
	"mintcream": [245, 255, 250],
	"mistyrose": [255, 228, 225],
	"moccasin": [255, 228, 181],
	"navajowhite": [255, 222, 173],
	"navy": [0, 0, 128],
	"oldlace": [253, 245, 230],
	"olive": [128, 128, 0],
	"olivedrab": [107, 142, 35],
	"orange": [255, 165, 0],
	"orangered": [255, 69, 0],
	"orchid": [218, 112, 214],
	"palegoldenrod": [238, 232, 170],
	"palegreen": [152, 251, 152],
	"paleturquoise": [175, 238, 238],
	"palevioletred": [219, 112, 147],
	"papayawhip": [255, 239, 213],
	"peachpuff": [255, 218, 185],
	"peru": [205, 133, 63],
	"pink": [255, 192, 203],
	"plum": [221, 160, 221],
	"powderblue": [176, 224, 230],
	"purple": [128, 0, 128],
	"rebeccapurple": [102, 51, 153],
	"red": [255, 0, 0],
	"rosybrown": [188, 143, 143],
	"royalblue": [65, 105, 225],
	"saddlebrown": [139, 69, 19],
	"salmon": [250, 128, 114],
	"sandybrown": [244, 164, 96],
	"seagreen": [46, 139, 87],
	"seashell": [255, 245, 238],
	"sienna": [160, 82, 45],
	"silver": [192, 192, 192],
	"skyblue": [135, 206, 235],
	"slateblue": [106, 90, 205],
	"slategray": [112, 128, 144],
	"slategrey": [112, 128, 144],
	"snow": [255, 250, 250],
	"springgreen": [0, 255, 127],
	"steelblue": [70, 130, 180],
	"tan": [210, 180, 140],
	"teal": [0, 128, 128],
	"thistle": [216, 191, 216],
	"tomato": [255, 99, 71],
	"turquoise": [64, 224, 208],
	"violet": [238, 130, 238],
	"wheat": [245, 222, 179],
	"white": [255, 255, 255],
	"whitesmoke": [245, 245, 245],
	"yellow": [255, 255, 0],
	"yellowgreen": [154, 205, 50]
};

var colorParse = parse;

/**
 * Base hues
 * http://dev.w3.org/csswg/css-color/#typedef-named-hue
 */
//FIXME: use external hue detector
var baseHues = {
	red: 0,
	orange: 60,
	yellow: 120,
	green: 180,
	blue: 240,
	purple: 300
};

/**
 * Parse color from the string passed
 *
 * @return {Object} A space indicator `space`, an array `values` and `alpha`
 */
function parse (cstr) {
	var m, parts = [], alpha = 1, space;

	if (typeof cstr === 'string') {
		//keyword
		if (colorName[cstr]) {
			parts = colorName[cstr].slice();
			space = 'rgb';
		}

		//reserved words
		else if (cstr === 'transparent') {
			alpha = 0;
			space = 'rgb';
			parts = [0,0,0];
		}

		//hex
		else if (/^#[A-Fa-f0-9]+$/.test(cstr)) {
			var base = cstr.slice(1);
			var size = base.length;
			var isShort = size <= 4;
			alpha = 1;

			if (isShort) {
				parts = [
					parseInt(base[0] + base[0], 16),
					parseInt(base[1] + base[1], 16),
					parseInt(base[2] + base[2], 16)
				];
				if (size === 4) {
					alpha = parseInt(base[3] + base[3], 16) / 255;
				}
			}
			else {
				parts = [
					parseInt(base[0] + base[1], 16),
					parseInt(base[2] + base[3], 16),
					parseInt(base[4] + base[5], 16)
				];
				if (size === 8) {
					alpha = parseInt(base[6] + base[7], 16) / 255;
				}
			}

			if (!parts[0]) parts[0] = 0;
			if (!parts[1]) parts[1] = 0;
			if (!parts[2]) parts[2] = 0;

			space = 'rgb';
		}

		//color space
		else if (m = /^((?:rgb|hs[lvb]|hwb|cmyk?|xy[zy]|gray|lab|lchu?v?|[ly]uv|lms)a?)\s*\(([^\)]*)\)/.exec(cstr)) {
			var name = m[1];
			var isRGB = name === 'rgb';
			var base = name.replace(/a$/, '');
			space = base;
			var size = base === 'cmyk' ? 4 : base === 'gray' ? 1 : 3;
			parts = m[2].trim()
				.split(/\s*[,\/]\s*|\s+/)
				.map(function (x, i) {
					//<percentage>
					if (/%$/.test(x)) {
						//alpha
						if (i === size)	return parseFloat(x) / 100
						//rgb
						if (base === 'rgb') return parseFloat(x) * 255 / 100
						return parseFloat(x)
					}
					//hue
					else if (base[i] === 'h') {
						//<deg>
						if (/deg$/.test(x)) {
							return parseFloat(x)
						}
						//<base-hue>
						else if (baseHues[x] !== undefined) {
							return baseHues[x]
						}
					}
					return parseFloat(x)
				});

			if (name === base) parts.push(1);
			alpha = (isRGB) ? 1 : (parts[size] === undefined) ? 1 : parts[size];
			parts = parts.slice(0, size);
		}

		//named channels case
		else if (cstr.length > 10 && /[0-9](?:\s|\/)/.test(cstr)) {
			parts = cstr.match(/([0-9]+)/g).map(function (value) {
				return parseFloat(value)
			});

			space = cstr.match(/([a-z])/ig).join('').toLowerCase();
		}
	}

	//numeric case
	else if (!isNaN(cstr)) {
		space = 'rgb';
		parts = [cstr >>> 16, (cstr & 0x00ff00) >>> 8, cstr & 0x0000ff];
	}

	//array-like
	else if (Array.isArray(cstr) || cstr.length) {
		parts = [cstr[0], cstr[1], cstr[2]];
		space = 'rgb';
		alpha = cstr.length === 4 ? cstr[3] : 1;
	}

	//object case - detects css cases of rgb and hsl
	else if (cstr instanceof Object) {
		if (cstr.r != null || cstr.red != null || cstr.R != null) {
			space = 'rgb';
			parts = [
				cstr.r || cstr.red || cstr.R || 0,
				cstr.g || cstr.green || cstr.G || 0,
				cstr.b || cstr.blue || cstr.B || 0
			];
		}
		else {
			space = 'hsl';
			parts = [
				cstr.h || cstr.hue || cstr.H || 0,
				cstr.s || cstr.saturation || cstr.S || 0,
				cstr.l || cstr.lightness || cstr.L || cstr.b || cstr.brightness
			];
		}

		alpha = cstr.a || cstr.alpha || cstr.opacity || 1;

		if (cstr.opacity != null) alpha /= 100;
	}

	return {
		space: space,
		values: parts,
		alpha: alpha
	}
}

//@ts-ignore


const FIELDS = ['fill', 'stroke'];

/**
 * Convert CSS style color onto array [r, g, b, a]
 * @param {ISeriesStyle} style
 */
function parseStyle (style) {
    const parsed = {...style};

    for(let key of FIELDS) {
        const orig = (style)[key];
        // default
        parsed[key] = [0,0,0,1];

        if (orig === void 0) {
            continue;
        }

        if (orig === null || orig === 'none') {
            // transparent for null
            parsed[key] = [0,0,0,0];
            continue;
        }

        // decode HEX and strings
        if (typeof orig === "string" || typeof orig === 'number') {
            const color = colorParse(orig);

            if (color && color.space && color.space.indexOf('rgb') !== 0) {
                throw new Error('Unknown style:' + orig);
            }

            if (color) {
                parsed[key] = [
                    color.values[0] / 0xff,
                    color.values[1] / 0xff,
                    color.values[2] / 0xff,
                    color.alpha];
            }
            // maybe array
        } else if(orig && orig.length === 4) {
            parsed[key] = orig;
        }
    }

    return parsed ;
}

class BaseDrawer  {constructor() { BaseDrawer.prototype.__init.call(this);BaseDrawer.prototype.__init2.call(this); }
    __init() {this.name = '';}

     __init2() {this.context = null;}

     init (context) {
        this.context = context;

        return true;
    }

     update()  {
        return false;
    }

     draw() {

    }

     reset() {

    }

     dispose() {

    }

     getParsedStyle() {
        return parseStyle(this.context.options.style);
    }

}

class LineDrawer extends BaseDrawer {constructor(...args) { super(...args); LineDrawer.prototype.__init.call(this);LineDrawer.prototype.__init2.call(this);LineDrawer.prototype.__init3.call(this); }
      __init() {this.name = 'LineDrawer';}
      __init2() {this.node = new Plot(null);}
    
     __init3() {this.alwaysUpdate = false;}

     init(context) {
        super.init(context);
        this.alwaysUpdate = context.options.type === CHART_TYPE.AREA;

        return (
            context.options.type === CHART_TYPE.AREA ||
            context.options.type === CHART_TYPE.LINE
        );
    }

    /**
     *
     * @param force - Update any case, no check a alpha === 0
     */
     update(force = false) {
        force = force || this.alwaysUpdate;

        const node = this.node;
        const {
            height
        } = this.context.limits;

        const {
            dataProvider,
        } = this.context;

        const style = this.getParsedStyle();

        if (!force && (style.stroke)[3] === 0) {
            node.alpha = 0;
            return;
        }

        node.clear();

        this.lastDrawnFetch = dataProvider.fetch();

        const {
            data,
            dataBounds
        } = this.lastDrawnFetch;

        node.lineStyle(style.thickness || 2, void 0, style.lineJoint );

        node.tint = rgb2hex(style.stroke );
        node.alpha = ( style.stroke)[3];

        hex2rgb(0xffffff, node.shader.uniforms.uGeomColor);

        for (let i = 0; i < data.length; i ++) {
            const x = data[i].x;
            const y = height - data[i].y;

            if (i === 0) {
                node.moveTo(x, y);
            } else {
                node.lineTo(x, y);
            }
        }

        super.update();
        return true;
    }

    reset() {
        this.node.clear();
    }

    fit() {

    }
}

class AreaDrawer extends BaseDrawer {
      __init() {this.name = 'AreaDrawer';}
      __init2() {this.node = new Container();}
    
    
     __init3() {this._localDrawer = false;}

    constructor() {
        super();AreaDrawer.prototype.__init.call(this);AreaDrawer.prototype.__init2.call(this);AreaDrawer.prototype.__init3.call(this);    }

    init (context) {
        super.init(context);

        if (context.options.type !== CHART_TYPE.AREA) {
            return  false;
        }

        this._lineDrawer = context.getDrawerPluginByClass(LineDrawer);
        this._localDrawer = false;

        this._areaNode = new PlotGradient();
        this._areaNode.masterPlot = this._lineDrawer.node;

        if (!this._lineDrawer) {
            this._localDrawer = true;
            this._lineDrawer = new LineDrawer();
            this._lineDrawer.init(this.context);

            this.node.addChild(
                this._lineDrawer.node
            );
        }

        // we should suppress optimisation on this case
        this._lineDrawer.alwaysUpdate = true;

        this.node.zIndex = this._lineDrawer.node.zIndex - 1;
        this.node.addChild(this._areaNode);

        return true;
    }

     update() {
        const style = this.getParsedStyle();
        const area = this._areaNode;

        if (this._localDrawer)
            this._lineDrawer.update(true);

        const fillColor = rgb2hex(style.fill );
        const fillAlpha = ( style.fill)[3];

        area.colorTop = area.colorBottom = fillColor;
        area.alphaTop = fillAlpha;
        area.alphaBottom = fillAlpha * 0.5;

        area.coordTop = 0;

        const viewport = this.context.limits;
        const dataBounds = this._lineDrawer.lastDrawnFetch.dataBounds;

        area.coordBottom = Math.max(viewport.height - dataBounds.fromY, viewport.height);

        area.tint = 0x1571D6;

        return true;
    }
}

function toStr(str) {
    return "" + str;
}

// return float part length
function fLen(n) {
    var s = toStr(n);
    var a = s.split(".");
    if (a.length > 1) {
        return a[1].length;
    }
    return 0;
}
// return float as int
function fInt(n) {
    var s = toStr(n);
    return parseInt(s.replace(".", ""));
}

function add(n1, n2) {
    var r1 = fLen(n1);
    var r2 = fLen(n2);
    if (r1 + r2 === 0) {
        return n1 + n2;
    } else {
        var m = Math.pow(10, Math.max(r1, r2));
        return (Math.round(n1 * m) + Math.round(n2 * m)) / m;
    }
}

function mul(n1, n2) {
    var r1 = fLen(n1);
    var r2 = fLen(n2);
    if (r1 + r2 === 0) {
        return n1 * n2;
    } else {
        var m1 = fInt(n1);
        var m2 = fInt(n2);
        return (m1 * m2) / Math.pow(10, r1 + r2);
    }
}

function nice(x, round) {
    var exp = Math.floor(Math.log(x) / Math.log(10));
    var f = x / Math.pow(10, exp);
    var nf;
    if (round) {
        if (f < 1.5) {
            nf = 1;
        } else if (f < 3) {
            nf = 2;
        } else if (f < 7) {
            nf = 5;
        } else {
            nf = 10;
        }
    } else {
        if (f <= 1) {
            nf = 1;
        } else if (f <= 2) {
            nf = 2;
        } else if (f <= 5) {
            nf = 5;
        } else {
            nf = 10;
        }
    }
    return nf * Math.pow(10, exp);
}

const toNum = function (num) {
    if (typeof (num) !== "number") {
        num = parseFloat(num);
    }
    if (isNaN(num)) {
        num = 0;
    }
    return num;
};


//https://wiki.tcl-lang.org/page/Chart+generation+support

function niceTicks(min, max, num = 4) {
    min = toNum(min);
    max = toNum(max);
    num = toNum(num);

    if (min === max) {
        max = min + 1;
    } else if (min > max) {
        var n = min;
        min = max;
        max = n;
    }

    var r = nice(max - min, false);
    var d = nice(r / (num - 1), true);
    var s = mul(Math.floor(min / d), d);
    var e = mul(Math.ceil(max / d), d);
    var arr = [];
    var v = s;
    while (v <= e) {
        arr.push(v);
        v = add(v, d);
    }
    return arr;
}

/**
 * Data plugin for generation a nice tics/labels
 */
class FancyLabelsPlugin  {constructor() { FancyLabelsPlugin.prototype.__init.call(this);FancyLabelsPlugin.prototype.__init2.call(this);FancyLabelsPlugin.prototype.__init3.call(this); }
      __init() {this.name = 'FancyLabelsPlugin';}
     __init2() {this.maxYTics = 10;}
     __init3() {this.maxXTics = 10;}
    

    
     static get instance() {
        if (!this._instance) {
            return this._instance = new FancyLabelsPlugin();
        }

        return this._instance;
    }

    init (context) {
        this.context = context;
        return true;
    }

    processElements(result, source) {
        /**
         * @todo
         * Do this more clear, atm we depend of data transformer trimmed output and fit options and this will invalid if there are another data processor
         * try to use a source data and results for computing valid ticks
         */
        const data = [];
        const chart = this.context.chart;
        const fitY = chart.options.style.fitYRange;
        const limits = chart.limits;
        const resultBounds = result.dataBounds;

        // fitY? What will be when fitted result is shifted?
        let scaleY = fitY ? limits.height : resultBounds.toY - resultBounds.fromY;

        let minX = result.trimmedSourceBounds.fromX;
        let maxX = result.trimmedSourceBounds.toX;
        let minY = result.trimmedSourceBounds.fromY;
        let maxY = result.trimmedSourceBounds.toY;

        this.maxYTics = Math.min(Math.round(limits.height / 50), 10);
        this.maxXTics = Math.min(Math.round(limits.width / 50), 10);

        const yScaleFactor = (maxY - minY) / scaleY;

        minY -= yScaleFactor * resultBounds.fromY;
        maxY += yScaleFactor * (limits.height - resultBounds.toY);

        const xTicks = niceTicks(minX, maxX, this.maxXTics);
        const yTicks = niceTicks(minY, maxY, this.maxYTics);

        const xLen = xTicks.length;
        const yLen = yTicks.length;

        for (let i = 0; i < Math.max(xLen, yLen); i ++) {
            let x = i < xLen ? xTicks[i] : xTicks[xLen - 1];
            let y = i < yLen ? yTicks[i] : yTicks[yLen - 1];

            const labelX = i < xLen ? x.toFixed(0) : null;
            const labelY = i < yLen ? y.toFixed(0) : null;

            const out = result.transform.apply({x, y});

            data.push({
                x: Math.round(out.x),
                y: Math.round(out.y),
                labelX,
                labelY
            });
        }

        result.data = data;

        return result;
    }
}

class GridDrawer extends BaseDrawer {constructor(...args) { super(...args); GridDrawer.prototype.__init.call(this);GridDrawer.prototype.__init2.call(this); }
      __init() {this.name = 'GridDrawer';}
     __init2() {this.node = new Graphics();}

    init(context) {
        // supress grid drawer when parent has parent, their grid will be used.
        if (context.parent) {
            return false;
        }

        this.node.zIndex = -100;

        return super.init(context);
    }

     update() {
        const {
            limits, range
        } = this.context;

        const node = this.node;
        this.context.dataProvider.use(FancyLabelsPlugin.instance);

        const data = this.context.dataProvider.fetch();

        node.clear()
            .lineStyle(2, 0xff0000, 0.2);

        for (const entry of data.data) {
            node.moveTo(entry.x, limits.fromY);
            node.lineTo(entry.x, limits.toY);

            node.moveTo(limits.fromX, limits.height - entry.y);
            node.lineTo(limits.toX, limits.height - entry.y);

        }

        super.update();
        return true;
    }
}

var LABEL_LOCATION; (function (LABEL_LOCATION) {
	const NONE = 'none'; LABEL_LOCATION["NONE"] = NONE;
	const TOP = 'top'; LABEL_LOCATION["TOP"] = TOP;
	const BOTTOM = 'bottom'; LABEL_LOCATION["BOTTOM"] = BOTTOM;
	const LEFT = 'left'; LABEL_LOCATION["LEFT"] = LEFT;
	const RIGHT = 'right'; LABEL_LOCATION["RIGHT"] = RIGHT;
})(LABEL_LOCATION || (LABEL_LOCATION = {}));

const DEFAULT_LABELS_STYLE = {
	x: {
		position: LABEL_LOCATION.BOTTOM,
	},
	y: {
		position: LABEL_LOCATION.LEFT
	}
};

const DEFAULT_LABELS_STYLE_PARENT = {
    x: {
        position: LABEL_LOCATION.NONE,
    },
    y: {
        position: LABEL_LOCATION.RIGHT
    }
};

const DEFAULT_STYLE = {
	fill: 0x0,
	stroke: 0x0,
	thickness: 2,
	lineJoint: LINE_JOIN.BEVEL,
	labels: DEFAULT_LABELS_STYLE,
	clamp: true,
	fitYRange: false,
};

const LABEL_TICS = 5;
const LABEL_WIDTH = 40;

function getCanvasContext(canvas, width, height) {
    canvas = canvas || (window.OffscreenCanvas
            ? new window.OffscreenCanvas(width, height)
            : document.createElement('canvas')
    );

    canvas.width = width;
    canvas.height = height;

    return canvas.getContext('2d');
}

class TicksElement extends Container {
    
    
    

    constructor(  horizontal = true) {
        super();this.horizontal = horizontal;
        this.view = new Sprite(Texture.WHITE);
        this.addChild(this.view);
    }

     update(data, {
                      width = 0,
                      height = 0
                  })
    {
        const ctx = getCanvasContext(this._canvas, width, height);

        this._texture = this._texture || Texture.from(ctx.canvas );
        this._texture.baseTexture.mipmap = MIPMAP_MODES$1.OFF;

        this._canvas = ctx.canvas;
        this.view.texture = this._texture;

        ctx.clearRect(0,0,width, height);
        ctx.lineWidth = 1;
        ctx.fillStyle = ctx.strokeStyle = 'black';
        ctx.font = '16px sans';


        const passed = new Set();

        // regen
        for (let { x, y, labelX, labelY } of data ) {
            const label = this.horizontal ? labelX : labelY;

            if (!label || passed.has(label)) {
                continue;
            }

            passed.add(label);

            if (this.horizontal) {
                ctx.moveTo(+x | 0, 0);
                ctx.lineTo(+x | 0, LABEL_TICS);

                ctx.fillText( label, (x | 0) - 15, LABEL_TICS * 4, 30);
            } else {
                y = height - y;

                ctx.moveTo((width - LABEL_TICS), y | 0);
                ctx.lineTo(width, y | 0);

                ctx.fillText( label, 4, y + 6);
            }

        }

        ctx.stroke();
        ctx.fill();

        this._texture.update();
    }

     dispose() {
        if (!this._canvas) {
            return;
        }

        this._texture.destroy(true);
        this._canvas.width = this._canvas.height = 0;
        this._canvas = null;
    }
}

class LabelsDrawer extends BaseDrawer {constructor(...args) { super(...args); LabelsDrawer.prototype.__init.call(this);LabelsDrawer.prototype.__init2.call(this);LabelsDrawer.prototype.__init3.call(this); }
     __init() {this.node = new Container();}
     __init2() {this.name = 'LabelDrawer';}

    
    
     __init3() {this._fancyPlugin = new FancyLabelsPlugin();}

     init(context) {
        const {
            x, y
        } = context.options.style.labels;

        if (context.parent) ;

        return (
            super.init(context) ||
            x.position === LABEL_LOCATION.NONE ||
            y.position === LABEL_LOCATION.NONE
        );
    }

     _updateYAxis(data) {
        const {
            limits, options
        } = this.context;

        const yStyle = options.style.labels.y;
        const node = this.node;

        if (yStyle.position === LABEL_LOCATION.NONE) {
            if(this._yTicks) {
                this._yTicks.dispose();
                this._yTicks = null;
            }

            return;
        }

        const width = LABEL_WIDTH;
        const baseX = yStyle.position === LABEL_LOCATION.LEFT
                ? limits.fromX
                : limits.toX - width;

        if (!this._yTicks) {
            this._yTicks = new TicksElement(false);
            node.addChild(this._yTicks);
        }

        this._yTicks.update(data.data, {
            width : width,
            height: limits.height
        });

        this._yTicks.x = baseX;
        this._yTicks.y = 0;
    }

     _updateXAxis(data) {
        const {
            limits, options
        } = this.context;

        const xStyle = options.style.labels.x;
        const node = this.node;

        if (xStyle.position === LABEL_LOCATION.NONE) {
            if(this._xTicks) {
                this._xTicks.dispose();
                this._xTicks = null;
            }

            return;
        }

        const width = LABEL_WIDTH;
        const base = xStyle.position === LABEL_LOCATION.TOP
            ? limits.fromY
            : limits.toY - width;

        if (!this._xTicks) {
            this._xTicks = new TicksElement(true);
            node.addChild(this._xTicks);
        }

        this._xTicks.update(data.data, {
            width : limits.width,
            height: width
        });

        this._xTicks.x = 0;
        this._xTicks.y = base;
    }


     update() {
        this.context.dataProvider.use(this._fancyPlugin);
        const data = this.context.dataProvider.fetch();

        this._updateXAxis(data);
        this._updateYAxis(data);

        super.update();

        return  true;
    }

    dispose() {
        super.dispose();

        this._xTicks && this._xTicks.dispose();
        this._yTicks && this._yTicks.dispose();
    }
}

function isValidEnum(prop, enumType) {
    if (!prop) {
        return false;
    }

    return Object.values(enumType).includes(prop);
}

function validate(options) {
    const result = {...options};

    if (!options.data) {
        throw  new Error('[Validate] Chart data must be presented!');
    }

    result.style =  {...DEFAULT_STYLE, ...(options.style) || {}};

    // validate type
    result.type = isValidEnum(options.type, CHART_TYPE) ? options.type : CHART_TYPE.LINE;

    // validate joints
    const joint = result.style.lineJoint;
    result.style.lineJoint = isValidEnum(joint, LINE_JOIN) ? joint : LINE_JOIN.BEVEL;

    if (options.parent) {
        result.style.labels = {
            x: {...DEFAULT_LABELS_STYLE_PARENT.x}, y: {...DEFAULT_LABELS_STYLE_PARENT.y},
            ...((options.style || {}).labels || {})
        };
    } else {
        result.style.labels = {
            x: {...DEFAULT_LABELS_STYLE.x}, y: {...DEFAULT_LABELS_STYLE.y},
            ...((options.style || {}).labels || {})
        };
    }

    return result;
}

/**
 * Root chart class that used for drawing a any kind of charts
 */
class Series extends EventEmitter {
     static __initStatic() {this.plugins = [];}

    /**
     * Plugin register API for attaching DrawerPlugins globally. This plugins will be used for each instance of Chart
     * @param plugin
     */
     static registerPlugin (plugin) {
        if (typeof plugin !== 'function' || !('init' in plugin.prototype)) {
            console.warn('[Chart plugin register] Plugin should have a valid constructor and has init method');
            return false;
        }

        this.plugins.push(plugin);
        return true;
    }

      __init() {this.node = new Container();}

      __init2() {this._plugins = [];}
      __init3() {this._activePlugins = [];}
      __init4() {this._range = new Range();}
      __init5() {this._localTransform = new Transform();}
      __init6() {this._worldTransform = new Transform();}

     get transform() {
        if (this.parent) {
            this._worldTransform.set(this.parent.transform);
            this._worldTransform.mul(this._localTransform);
        } else {
            this._worldTransform.set(this._localTransform);
        }

        return this._worldTransform;
    }

      __init7() {this.limits = new Range();}

    /**
     * Chart name
     */
     __init8() {this.name = '';}

    /**
     * Input service that attached on current chart
     */
    
    /**
     * Current Chart context for bounded Series
     */
    

    

    

     get range() {
        this._range.set(this.limits);
        this._range.transform(this.transform);

        return this._range;
    }

    
    
     __init9() {this._updateId = -1;}
     __init10() {this._drawId = -1;}

     get updateId() {
        return this._updateId;
    }

     get drawId() {
        return this._drawId;
    }


    /**
     * Instance a Chart with provided data, chart data should be immutable
     * Handle the drawers that will be used for current Chart instances.
     * @param { ISeriesDataOptions } options
     * @param { IDrawerPlugin[] } plugins Drawers object that can be used in current chart
     */
    constructor (
          options,
        plugins = [],
    ) {
        super();this.options = options;Series.prototype.__init.call(this);Series.prototype.__init2.call(this);Series.prototype.__init3.call(this);Series.prototype.__init4.call(this);Series.prototype.__init5.call(this);Series.prototype.__init6.call(this);Series.prototype.__init7.call(this);Series.prototype.__init8.call(this);Series.prototype.__init9.call(this);Series.prototype.__init10.call(this);
        this.name = options.name;
        this.onRangeChanged = this.onRangeChanged.bind(this);
        this.onWheel = this.onWheel.bind(this);

        this.options = validate(options);

        this.preparePlugins(plugins);
    }

     bind (context, parent = null) {
        this.parent = parent;
        this.context = context;
        this.input = context.input;

        this._localTransform.on(Transform.CHANGE, this.onRangeChanged);

        if (this.parent) {
            this.parent.transform.on(Transform.CHANGE, this.onRangeChanged);
        }

        this.node.interactive = true;
        this.node.interactiveChildren = false;

        // TODO
        // Rebound onto input
        this.node.on('pointermove', this.onDrag, this);
        document.addEventListener('wheel', this.onWheel);

        this.init();
    }

     unbind (context) {
        this._localTransform.off(Transform.CHANGE, this.onRangeChanged);
        if (this.parent) {
            this.parent.transform.off(Transform.CHANGE, this.onRangeChanged);
        }

        this.node.interactive = false;
        this.node.interactiveChildren = false;

        // TODO
        // Rebound onto input
        this.node.off('pointermove', this.onDrag, this);
        document.removeEventListener('wheel', this.onWheel);

        this.context = null;
        this.input = null;
        this.parent = null;
    }

     preparePlugins (externalPlugins) {
        this._plugins.length = 0;

        const pluginName = new Set();

        for (const Ctor of Series.plugins) {
            const instance = new Ctor();

            if (!instance.name || pluginName.has(instance.name)) {
                console.warn('[Chart plugin init] Plugin not has name or already registered with same name:' + instance.name);
                continue;
            }

            pluginName.add(instance.name);
            this._plugins.push(instance);
        }

        for (const external of externalPlugins) {
            if (!external.name || pluginName.has(external.name)) {
                console.warn('[Chart plugin init] External Plugin not has name or already registered with same name:' + external.name);
                continue;
            }

            this._plugins.push(external);
        }
    }

     init() {
        this.parse();

        this._activePlugins.length = 0;
        this.node.removeChildren();

        for (const plugin of this._plugins) {
            if (!plugin.init(this)) {
                continue;
            }

            this._activePlugins.push(plugin);

            if (plugin.node) {
                this.node.addChild(plugin.node);
            }
        }

        this.node.sortChildren();
    }

     update() {
        if (this._updateId === 0) {
            return false;
        }

        for (const plugin of this._activePlugins) {
            if (plugin.update && plugin.update()) {
                this._drawId ++;
            }
        }

        this._updateId = 0;
        return true;
    }

     draw() {
        if (this._drawId === 0) {
            return false;
        }

        for (const plugin of this._activePlugins) {
            plugin.draw && plugin.draw();
        }

        this._drawId = 0;

        return true;
    }

     reset() {
        for (const plugin of this._activePlugins) {
            plugin.reset && plugin.reset();
        }

        // remove all childs
        this.node.removeChildren();
        this._activePlugins.length = 0;

        this._drawId = this._updateId = -1;
    }

     destroy(_options) {
        this.node.destroy(_options);

        this.reset();

        for (const plugin of this._plugins) {
            plugin.dispose && plugin.dispose();
        }

        this._plugins.length = 0;

        this.emit(CHART_EVENTS.DESTROY, this);
    }

     scaleAtPoint (point, sx, sy) {
        const clamp = this.options.style.clamp;

        this._localTransform.translate(-point.x, -point.y);
        this._localTransform.scale(sx, sy);
        this._localTransform.translate(point.x, point.y);

        if (clamp) {
            this._range.set(this.limits);
            this._range.transform(this._localTransform, this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform);
        }

        this._emitUpdate();
    }

     transformRange({
        tx = 0, ty = 0, sx = 1, sy = 1
    } = {}) {
        const {
            clamp
        } = this.options.style;

        this._localTransform.translate(tx, ty);
        this._localTransform.scale(sx, sy);

        if (clamp) {
            this._range.set(this.limits);
            this._range.transform(this._localTransform, this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform);
        }

        this._emitUpdate();
    }

     onWheel(event) {
        if (this.parent) {
            return;
        }

        if (!this._lastMousePoint) {
            return;
        }

        const pos = this._lastMousePoint;

        if (
            this.limits.fromX > pos.x ||
            this.limits.toX < pos.x ||
            this.limits.fromY > pos.y ||
            this.limits.toY < pos.y
        ) {
            return;
        }

        const scaleX = event.deltaY > 0 ? 1.1 : 0.9;
        const scaleY = 1;

        this.scaleAtPoint(pos, scaleX, scaleY);
    }

     onDrag(event) {
        if (this.parent) {
            return;
        }

        const pos = event.data.global;
        this._lastMousePoint = pos.clone();

        if (
            this.limits.fromX > pos.x ||
            this.limits.toX < pos.x ||
            this.limits.fromY > pos.y ||
            this.limits.toY < pos.y
        ) {
            return;
        }

        const original = event.data.originalEvent ;

        if (original.buttons & 0x1) {

            if (this._lastPressedMousePoint) {
                const tx = pos.x - this._lastPressedMousePoint.x;
                const ty = -(pos.y - this._lastPressedMousePoint.y);

                this.transformRange({
                    tx, ty
                });
                this._emitUpdate();
            }

            this._lastPressedMousePoint = event.data.global.clone();
        } else {
            this._lastPressedMousePoint = null;
        }
    }

     onRangeChanged (_field, _old, _newValue) {
        this._emitUpdate();
    }

     parse() {
        const data = this.options.data;
        this.options.labels;

        let dataProvider;

        let primitiveData;

        // parse data source
        if ('data' in data) {
            if ('fetch' in data) {
                dataProvider = data;
            } else {
                primitiveData = data.data;
            }
        } else {
            primitiveData = data ;
        }

        if (!dataProvider) {
            const firstEntry = primitiveData[0];

            // array like
            if (Array.isArray(firstEntry) && firstEntry.length === 2) {
                dataProvider = new ArrayChainDataProvider(primitiveData);

            } else if (typeof firstEntry === 'object' && ('x' in firstEntry) && ('y' in firstEntry)) {
                // object like

                dataProvider = new ObjectDataProvider(primitiveData);
            } else {

                // is array
                dataProvider = new ArrayLikeDataProvider(primitiveData);
            }
        }

        this.dataProvider = new PluggableProvider(dataProvider, this);

        this._emitUpdate();
    }

     setViewport (x, y, width, height) {
        this.node.hitArea = new Rectangle(x, y, width, height);

        if (!this.parent) {
            this._range.set(this.limits);
        }

        this.limits.set({
            fromX: x, fromY: y, toX: x + width, toY: y + height
        });

        if (!this.parent) {
            this._range.clampToMin(this.limits);
            this._range.decomposeFrom(this.limits, this._localTransform, 'right');
        }

        this.emit(CHART_EVENTS.RESIZE, this);
        this._emitUpdate();
    }

     getDrawerPluginByName (name, activeOnly = false) {
        return (activeOnly ? this._activePlugins : this._plugins).find(e => e.name === name) ;
    }

     getDrawerPluginByClass (classType, activeOnly = false) {
        return (activeOnly ? this._activePlugins : this._plugins).find(e => e.constructor === classType) ;
    }

     _emitUpdate() {
        this._updateId ++;
        this.emit(CHART_EVENTS.UPDATE, this);
    }
} Series.__initStatic();

// Register Data plugins
PluggableProvider.registerPlugin(DataTransformPlugin);

// register a Chart drawer plugin
Series.registerPlugin(GridDrawer);
Series.registerPlugin(LineDrawer);
Series.registerPlugin(AreaDrawer);
Series.registerPlugin(LabelsDrawer);

Renderer.registerPlugin('batch', BatchRenderer);
Renderer.registerPlugin('interaction', InteractionManager);

class Chart {
     __init() {this.series = new Set();}
     __init2() {this.ticker = new Ticker();}
    
     __init3() {this.stage = new Container();}
     __init4() {this.size


 = {
        width: 0, height: 0
    };}

    

    constructor(canvasOrId) {Chart.prototype.__init.call(this);Chart.prototype.__init2.call(this);Chart.prototype.__init3.call(this);Chart.prototype.__init4.call(this);Chart.prototype.__init5.call(this);Chart.prototype.__init6.call(this);
        const view = canvasOrId instanceof HTMLCanvasElement
                ? canvasOrId
                : document.querySelector(canvasOrId);

        const scale = window.devicePixelRatio;
        this.size.width = view.clientWidth * scale;
        this.size.height = view.clientHeight * scale;
        this.renderer = new Renderer({
            view,
            width: this.size.width,
            height: this.size.height,
            backgroundAlpha: 0,
            useContextAlpha: true,
        });

        this.update = this.update.bind(this);
        this.draw = this.draw.bind(this);
        this.onDimensionUpdateLazy = this.onDimensionUpdateLazy.bind(this);
        this.onDimensionUpdate = this.onDimensionUpdate.bind(this);
        this.onSeriesUpdate = this.onSeriesUpdate.bind(this);
        this.removeSeries = this.removeSeries.bind(this);

        this.input = new PixiInput(this.renderer.plugins.interaction);

        //@ts-ignore
        if (self.ResizeObserver) {
            //@ts-ignore
            new self.ResizeObserver(this.onDimensionUpdateLazy).observe(view);
        }

        this.ticker.add(this.update);
        this.ticker.add(this.draw, UPDATE_PRIORITY.LOW);

        this.ticker.start();
    }

     __init5() {this.timeout = -1;}
     __init6() {this.onResizeProcess = false;}

     onDimensionUpdateLazy() {
        self.clearTimeout(this.timeout);
        this.onResizeProcess = true;
        this.timeout = self.setTimeout(this.onDimensionUpdate, 100);
    }

     onDimensionUpdate () {
        self.clearTimeout(this.timeout);
        this.onResizeProcess = false;
        this.timeout = -1;

        const view = this.renderer.view;
        this.size.width = view.clientWidth * window.devicePixelRatio;
        this.size.height = view.clientHeight * window.devicePixelRatio;

        this.renderer.resize(
            this.size.width,
            this.size.height
        );

        this.series
            .forEach(e => e.setViewport(0,0, this.size.width, this.size.height) );
    }

     onSeriesUpdate(chart) {
        // nothing
        // this.draw();
    }

    /**
     * Add chart series based on data objects passed as argument
     * @param data
     * @param nested - Series data will linked on latest added (or first if there are not) to follow transforming
     */
     add ( data, nested = false) {
        // process Array of series options
        if (Array.isArray(data)) {
            for (const subdata of data) {
                this.add(subdata);
            }
            return this;
        }

        let parent;
        if (data.parent instanceof Series) {
            parent = data.parent;

            if (!this.series.has(data.parent)) {
                console.warn('Series parent must be attached to same Chart');
                parent = null;
            }
        } else if (typeof data.parent === "string" && data.parent) {
            parent = this.getByName(data.parent);

            if (!parent) {
                console.warn(`Parent by name:${data.parent} wasn't find`);
            }
        }

        if (!parent && nested) {
            parent = this.tall;
        }

        if (data instanceof Series) {
            this.addSeries(data);
            return;
        }

        // process multi series data
        if ('datasets' in data && Array.isArray(data.datasets)) {
            // process Array of series options
            for (let i = 0; i < data.datasets.length; i ++) {
                const style = data.styles ? data.styles[Math.min(i, data.styles.length - 1)] : void 0;
                const name = `${data.name || ('series_' + this.stage.children.length)}:${i}`;
                const series = new Series(
                    {
                        name: name,
                        type: data.type,
                        parent: parent,
                        data: data.datasets[i],
                        style: style,
                    } 
                );

                // use first chart as parent for others
                if (i === 0 && !parent) {
                    parent = series;
                }

                this.addSeries(series);
            }

            return this;
        }

        data.parent = parent;

        this.addSeries(new Series(data ));

        return  this;
    }

     getByName(name) {
        for (const s of  this.series) {
            if (s.name === name) {
                return s;
            }
        }

        return null;
    }

     get tall() {
        return [...this.series].pop();
    }

     addSeries(series, name = 'series_' + this.stage.children.length) {
        if (this.series.has(series)) {
            return  series;
        }

        // resolve parent;
        this.series.add(series);

        series.name = series.name || name;
        series.setViewport(0,0, this.size.width, this.size.height);

        this._bindEvents(series);

        let parent = series.options.parent;

        if (typeof parent === 'string') {
            parent = this.getByName(parent);
        }else if (parent instanceof Series && !this.series.has(parent)) {
            parent = null;
        }

        series.bind(this, parent );

        this.stage.addChild(series.node);

        return series;
    }

     removeSeries(name) {
        const series = this.getByName(name);
        if (!series) {
            return ;
        }

        this._unbindEvents(series);
        this.series.delete(series);

        series.unbind(this);

        for (let other of this.series) {
            if (other.parent === series) {
                console.warn(`Parent series for ${other.name} was removed`);
                other.unbind(this);
                other.bind(this, null);
            }
        }

        this.stage.removeChild(series.node);

        return series;
    }

     _unbindEvents (chart) {
        this.input.unregister(chart);

        chart.off(CHART_EVENTS.UPDATE, this.onSeriesUpdate);
        chart.off(CHART_EVENTS.DESTROY, this.removeSeries);
    }

     _bindEvents (chart) {
        chart.on(CHART_EVENTS.UPDATE, this.onSeriesUpdate);
        chart.on(CHART_EVENTS.DESTROY, this.removeSeries);

        this.input.register(chart);
    }

     update() {
        this.input.update(this.ticker.elapsedMS);

        for (const series of this.series) {
            series.update();
        }
    }

     draw() {
        if (this.onResizeProcess) {
            return;
        }

        let dirtySeries = 0;

        for (const series of this.series) {
            if(series.draw()) {
                dirtySeries ++;
            }
        }

        if (dirtySeries !== 0) {
            this.renderer.render(this.stage);
        }
    }
}

export { ArrayChainDataProvider, ArrayLikeDataProvider, BaseDrawer, BaseInput, CHART_EVENTS, CHART_TYPE, Chart, DEFAULT_LABELS_STYLE, DEFAULT_LABELS_STYLE_PARENT, DEFAULT_STYLE, DataTransformPlugin, LABEL_LOCATION, ObjectDataProvider, Observable, PixiInput, PluggableProvider, Range, Series, Transform, parseStyle };
//# sourceMappingURL=pixi-charts.es.js.map
