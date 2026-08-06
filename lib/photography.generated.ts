import type { PhotoAsset } from "./photography.types";

export const photographyMetrics = {
  "profileVersion": 1,
  "tools": {
    "sharp": "0.34.5",
    "vips": "8.17.3"
  },
  "recognisedSourceCount": 22,
  "dngCount": 2,
  "confirmedPanoramaCount": 2,
  "possiblePanoramaCount": 6,
  "totalSourceBytes": 172502059,
  "medianSourceBytes": 6553355,
  "largestSourceBytes": 40264338,
  "totalSourceMegapixels": 540.99,
  "aspectRatioDistribution": {
    "portrait": 10,
    "landscape": 10,
    "square": 0,
    "panorama": 2
  },
  "exactDuplicateGroups": 0,
  "likelyDuplicateGroups": 2,
  "filesContainingGps": 7,
  "filesContainingSerialNumbers": 0,
  "filesRequiringManualConversion": 0,
  "publishedPhotoCount": 20,
  "totalGeneratedBytes": 28909050,
  "bytesByRole": {
    "thumb": 186236,
    "grid": 2389180,
    "viewer": 9804708,
    "panorama": 16079776,
    "poster": 449150
  },
  "medianThumbBytes": 8795,
  "medianGridBytes": 116015,
  "medianViewerBytes": 464354,
  "panoramaBytes": 16079776,
  "averageReductionPercent": 57.92,
  "medianReductionPercent": 45.85,
  "coldProcessingDurationMs": 28531.03,
  "warmRerunDurationMs": 1.43,
  "skippedFiles": 20,
  "processedFiles": 0,
  "failures": 0
} as const;

export const photos = [
  {
    "id": "20251219-000319-03a8c2a2",
    "no": "01",
    "type": "photo",
    "thumbSrc": "/photos/generated/20251219-000319-03a8c2a2/thumb.webp",
    "gridSrc": "/photos/generated/20251219-000319-03a8c2a2/grid.webp",
    "viewerSrc": "/photos/generated/20251219-000319-03a8c2a2/viewer.webp",
    "width": 4518,
    "height": 5533,
    "aspectRatio": 0.816555,
    "orientation": "portrait",
    "dominantColor": "#38a8f8",
    "blurDataURL": "data:image/webp;base64,UklGRsQAAABXRUJQVlA4ILgAAABQBgCdASoaACAAPxF0s1EsJqSiqA1RgCIJbACxHxGycn/AMefsMwNWMo2CAr4vbynOOiIQklYX+845AADKjHHtItCWphCkAs7GiqoCW4P4Cv/TxBC6ADA/UykA7Of7OOoAStB6sP2CD3NVOzCVEWOd2w9YvZyW/9lGzQ7OScIGMZObSoYg6TMK0KHU5g2CV50F96nd5PmKWv3lzb66wtns1ysawBsoLa/3XonqsoymIfH8K96e3cAA",
    "alt": "A stepped bathing ghat descends toward a river beneath wooded hills and a blue sky.",
    "altStatus": "draft",
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 4518,
      "sourceHeight": 5533,
      "sourceBytes": 29512097,
      "generatedBytes": {
        "thumb": 12264,
        "grid": 190050,
        "viewer": 884024
      }
    }
  },
  {
    "id": "effects-aaf368f4",
    "no": "02",
    "type": "photo",
    "thumbSrc": "/photos/generated/effects-aaf368f4/thumb.webp",
    "gridSrc": "/photos/generated/effects-aaf368f4/grid.webp",
    "viewerSrc": "/photos/generated/effects-aaf368f4/viewer.webp",
    "width": 4224,
    "height": 3168,
    "aspectRatio": 1.333333,
    "orientation": "landscape",
    "dominantColor": "#d8d8d8",
    "blurDataURL": "data:image/webp;base64,UklGRoQAAABXRUJQVlA4IHgAAACQBQCdASogABgAPxFys1AsJqSisBgMAYAiCWkAAU9wOp038xPQdSsLTJJSO2GMHw/d531/AAD41Sa4Ath6tQwu0yU0UG4ypGHKObjONtBjKJoxxDHLaFWxrJTqzyy2ROpQ+xvb8g5VsGhD68W1ehe7LBKoVMcYAAA=",
    "alt": "Black-and-white view of a tall clock tower with birds crossing the cloudy sky.",
    "altStatus": "draft",
    "capturedAt": "2019-02-10T12:53:21.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm"
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 4224,
      "sourceHeight": 3168,
      "sourceBytes": 768646,
      "generatedBytes": {
        "thumb": 4256,
        "grid": 43066,
        "viewer": 336850
      }
    }
  },
  {
    "id": "img-20181011-175025-a5d8b245",
    "no": "03",
    "type": "photo",
    "thumbSrc": "/photos/generated/img-20181011-175025-a5d8b245/thumb.webp",
    "gridSrc": "/photos/generated/img-20181011-175025-a5d8b245/grid.webp",
    "viewerSrc": "/photos/generated/img-20181011-175025-a5d8b245/viewer.webp",
    "width": 4096,
    "height": 2048,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#c8d8d8",
    "blurDataURL": "data:image/webp;base64,UklGRpYAAABXRUJQVlA4IIoAAABQBACdASogABAAPxF0slCsJqSisAgBgCIJYwC06Gmfw1+LdMl1F9SnA2gAAP7zenSR4xCCZ3xW8h/kswFy7PX9py4S8h+jxrGU+UTX9OU92mVcKvWwim5Yf4G+H6M4Ii8kh1CXCyNyZbZD5DWYusDiVRGwBVQhVAgDJ431jOJOt+6BwHeJ7j+AAAA=",
    "alt": "A white stone temple stands beyond trees against an overcast sky.",
    "altStatus": "draft",
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 4096,
      "sourceHeight": 2048,
      "sourceBytes": 1016728,
      "generatedBytes": {
        "thumb": 7624,
        "grid": 126964,
        "viewer": 570078
      }
    }
  },
  {
    "id": "img-20181015-195513-01-358f1451",
    "no": "04",
    "type": "photo",
    "thumbSrc": "/photos/generated/img-20181015-195513-01-358f1451/thumb.webp",
    "gridSrc": "/photos/generated/img-20181015-195513-01-358f1451/grid.webp",
    "viewerSrc": "/photos/generated/img-20181015-195513-01-358f1451/viewer.webp",
    "width": 4095,
    "height": 1658,
    "aspectRatio": 2.469843,
    "orientation": "landscape",
    "dominantColor": "#382818",
    "blurDataURL": "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAADQAwCdASogAA0APxFysVCsJqSisAgBgCIJbACdEf/gpqLz02tPudQAzhkqzNXn9If+2qBuABwf9wOrSafjenAalGUg3lpIBc4/nRN0Em78TE1jV/tfrFg/54UwOlcRX5lubBXKHZ0bkDkP0dkm86tLt3nhDMwWvberKihm+290rdzLp06acqoxj75liUUAd4lW4XQNrDFYdPcOAPpqUBAA",
    "alt": "Low sunlight shines through a stone arch toward a garden.",
    "altStatus": "draft",
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 4095,
      "sourceHeight": 1658,
      "sourceBytes": 834755,
      "generatedBytes": {
        "thumb": 7064,
        "grid": 85362,
        "viewer": 396124
      }
    }
  },
  {
    "id": "img20180730075246-27dc047c",
    "no": "05",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20180730075246-27dc047c/thumb.webp",
    "gridSrc": "/photos/generated/img20180730075246-27dc047c/grid.webp",
    "viewerSrc": "/photos/generated/img20180730075246-27dc047c/viewer.webp",
    "width": 2080,
    "height": 4160,
    "aspectRatio": 0.5,
    "orientation": "portrait",
    "dominantColor": "#b8c8d8",
    "blurDataURL": "data:image/webp;base64,UklGRpAAAABXRUJQVlA4IIQAAAAwBACdASoQACAAPxFysVCsJqSisAgBgCIJbAC7AGoRi//++6T1Uv/iFgAA/sjF6un67Cv178ZDWzEmbhXHPqjsdZVgKITQk47koprutP05PlPtZDFgzFnX4POy6pDip5nZdPFsFnLZjG4wiMzTd5iclUBRPwGZbRttRLN1ppr3nHeAAAA=",
    "alt": "A paved path runs between geometric lawns toward a distant monument.",
    "altStatus": "draft",
    "capturedAt": "2018-07-30T02:22:46.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/541s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 2080,
      "sourceHeight": 4160,
      "sourceBytes": 659060,
      "generatedBytes": {
        "thumb": 5052,
        "grid": 65920,
        "viewer": 321274
      }
    }
  },
  {
    "id": "img20180730075510-d1321d3d",
    "no": "06",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20180730075510-d1321d3d/thumb.webp",
    "gridSrc": "/photos/generated/img20180730075510-d1321d3d/grid.webp",
    "viewerSrc": "/photos/generated/img20180730075510-d1321d3d/viewer.webp",
    "width": 4160,
    "height": 2080,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#c8d8d8",
    "blurDataURL": "data:image/webp;base64,UklGRroAAABXRUJQVlA4IK4AAADQBACdASogABAAPxFysVAsJqSisAgBgCIJbAC7LwGUBi/7dABFffIfMkRzCZtEgAD30YVDWGMTGPpAH67GX9bKfBDeNcBrNfDqf5ydmzf4OmhEAwHIBRLgaLZiuZmHTnJMiTBQWH0FeC2NR2iVUyKuAxPwKKX1mNpwl/LKB0ACq11s0xhRab3Mb/tiEqWYPA1Ccv/y2uo/A2P1xrSUHMlmv/VZoTM1Eh2eSJxxEAA=",
    "alt": "Pink flowers fill the foreground of a formal garden with a long sandstone building beyond.",
    "altStatus": "draft",
    "capturedAt": "2018-07-30T02:25:10.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/437s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 4160,
      "sourceHeight": 2080,
      "sourceBytes": 2061312,
      "generatedBytes": {
        "thumb": 19700,
        "grid": 237678,
        "viewer": 944800
      }
    }
  },
  {
    "id": "img20180817145424-b83e7f16",
    "no": "07",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20180817145424-b83e7f16/thumb.webp",
    "gridSrc": "/photos/generated/img20180817145424-b83e7f16/grid.webp",
    "viewerSrc": "/photos/generated/img20180817145424-b83e7f16/viewer.webp",
    "width": 4160,
    "height": 2080,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#a88878",
    "blurDataURL": "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAABwBACdASogABAALtGIxGIkLCwsDADQS1AE6QG+T/PAAgfw5IVcuPNBlqNEYAD8i+CFEYwcE+DuCfcaEkOdi4b/7hdjdFoznVYuDdKSRjKz5iQnh3KOaAENDfg9CyUvYauUya5+6dA7Uz53yKuOz5a3N3J2Sn6sK1Kun7iVlJxsZ6l7ocpJ6Pc27AJ/BwrYN4B4BEQA",
    "alt": "A circular sunken garden interrupts a broad red-and-cream plaza.",
    "altStatus": "draft",
    "capturedAt": "2018-08-17T09:24:24.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/617s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 4160,
      "sourceHeight": 2080,
      "sourceBytes": 891288,
      "generatedBytes": {
        "thumb": 7048,
        "grid": 91980,
        "viewer": 432812
      }
    }
  },
  {
    "id": "img20180817150203-8a110ca9",
    "no": "08",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20180817150203-8a110ca9/thumb.webp",
    "gridSrc": "/photos/generated/img20180817150203-8a110ca9/grid.webp",
    "viewerSrc": "/photos/generated/img20180817150203-8a110ca9/viewer.webp",
    "width": 4160,
    "height": 2080,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#a8a898",
    "blurDataURL": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAADwBACdASogABAAPxFysFAsJqSisAgBgCIJbACdMoMzGEoK9W9CJ43JcofllwucpAAA/sB1Hhb4+d0z8LToc1s2MC+G6ylRE9AEXam86mL1RJAWubPfa27D/YOJO/KlnLTkx6498ESnV6vH9vQFFTzAPzLx6i6TRu7KWnmVOqYfapfBJaer4AAA",
    "alt": "A curved paved path climbs through sculpted green embankments.",
    "altStatus": "draft",
    "capturedAt": "2018-08-17T09:32:03.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/815s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 4160,
      "sourceHeight": 2080,
      "sourceBytes": 1008540,
      "generatedBytes": {
        "thumb": 6934,
        "grid": 112270,
        "viewer": 524974
      }
    }
  },
  {
    "id": "img20180829144207-53652297",
    "no": "09",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20180829144207-53652297/thumb.webp",
    "gridSrc": "/photos/generated/img20180829144207-53652297/grid.webp",
    "viewerSrc": "/photos/generated/img20180829144207-53652297/viewer.webp",
    "width": 4160,
    "height": 2080,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#a8b8c8",
    "blurDataURL": "data:image/webp;base64,UklGRqAAAABXRUJQVlA4IJQAAACwBACdASogABAAPxFysVCsJqSisAgBgCIJaACdMoEURBIfBzEk7KwddQSpBT9wAPuFuLzZl6SwI96ZVzZuevmfnE37k3A+2HoIRRJOTrTZDdHOtjKHVrc6ASx+rp2LphmHshJ2pyDfX4tkRZPYzXUwp1W2Im/sJPFjByrT5tydQx87t1ZcJhg2wKEDDQAojT9YAAAA",
    "alt": "Pink flowering shrubs frame a pale clock tower beneath dark clouds.",
    "altStatus": "draft",
    "capturedAt": "2018-08-29T09:12:08.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/251s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 4160,
      "sourceHeight": 2080,
      "sourceBytes": 750751,
      "generatedBytes": {
        "thumb": 8922,
        "grid": 102402,
        "viewer": 395778
      }
    }
  },
  {
    "id": "img20181006163632-060311d6",
    "no": "10",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20181006163632-060311d6/thumb.webp",
    "gridSrc": "/photos/generated/img20181006163632-060311d6/grid.webp",
    "viewerSrc": "/photos/generated/img20181006163632-060311d6/viewer.webp",
    "width": 3710,
    "height": 1855,
    "aspectRatio": 2,
    "orientation": "landscape",
    "dominantColor": "#587808",
    "blurDataURL": "data:image/webp;base64,UklGRqwAAABXRUJQVlA4IKAAAAAQBACdASogABAAPxFysFAsJqSisAgBgCIJagC06A8ajszIiT+vxEO4qAD7Zw+BMCuqEMjuPoTwDwknr+xkPK8gypP3uRj0CMGFglrRY8O9JxDvV/ARHT/aZeBZ0UxsJwOqxc6HPcVO1VAGX6A3/F6QYDE+tCrGvyHKI0fhXREdFFlMDqn0W5onvzovL6+R2mjAEFOaS96Qnjk0LCY7c4AA",
    "alt": "Raindrops rest on a broad green leaf in close-up.",
    "altStatus": "draft",
    "capturedAt": "2018-10-06T11:06:32.000Z",
    "exif": {
      "camera": "OPPO Realme 1",
      "focalLength": "3.5 mm",
      "aperture": "f/2.2",
      "shutterSpeed": "1/144s",
      "iso": 38
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "possible-panorama",
      "sourceWidth": 3710,
      "sourceHeight": 1855,
      "sourceBytes": 442696,
      "generatedBytes": {
        "thumb": 5472,
        "grid": 34908,
        "viewer": 139756
      }
    }
  },
  {
    "id": "img20220320130546-9661814b",
    "no": "11",
    "type": "photo",
    "thumbSrc": "/photos/generated/img20220320130546-9661814b/thumb.webp",
    "gridSrc": "/photos/generated/img20220320130546-9661814b/grid.webp",
    "viewerSrc": "/photos/generated/img20220320130546-9661814b/viewer.webp",
    "width": 3456,
    "height": 4608,
    "aspectRatio": 0.75,
    "orientation": "portrait",
    "dominantColor": "#e8e8f8",
    "blurDataURL": "data:image/webp;base64,UklGRoAAAABXRUJQVlA4IHQAAACQBACdASoYACAAPxF2tlMsJyUisBgIAYAiCWMAAHZX0s7DcthQTuAHe8z3I6AA/FMORTuEwtM1R9KOf9Wjfj6GfRhzgBeCettZpuKTEadofpOe2KhtDftihNaP02vol2+0WrcROP9XMFn3/xJtHMv1FzrgAA==",
    "alt": "A snow-covered mountain valley beneath a pale blue sky.",
    "altStatus": "draft",
    "capturedAt": "2022-03-20T07:35:46.000Z",
    "exif": {
      "camera": "realme realme GT Neo2 5G",
      "focalLength": "5.6 mm",
      "aperture": "f/1.8",
      "shutterSpeed": "1/5461s",
      "iso": 100
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "raw-dng",
      "sourceWidth": 4608,
      "sourceHeight": 3456,
      "sourceBytes": 573957,
      "generatedBytes": {
        "thumb": 6098,
        "grid": 64644,
        "viewer": 282042
      }
    }
  },
  {
    "id": "pxl-20220320-130606520-photosphere-1cdb9037",
    "no": "12",
    "type": "panorama360",
    "thumbSrc": "/photos/generated/pxl-20220320-130606520-photosphere-1cdb9037/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20220320-130606520-photosphere-1cdb9037/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20220320-130606520-photosphere-1cdb9037/panorama-poster.webp",
    "posterSrc": "/photos/generated/pxl-20220320-130606520-photosphere-1cdb9037/panorama-poster.webp",
    "panoramaSrc": "/photos/generated/pxl-20220320-130606520-photosphere-1cdb9037/panorama.jpg",
    "width": 8704,
    "height": 4352,
    "aspectRatio": 2,
    "orientation": "panorama",
    "dominantColor": "#c8c8d8",
    "blurDataURL": "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAAAwBQCdASogABQAPxF2sVAsJ6SisAgBgCIJYwCdACDkCMw8Y4yfMy1nYryZAIUTSgtAAADJstKdSWyPHNQpp3VjgPqylKCIALOFSTNr0m1AAzkJZVycDHZGMorSXo3cjqnGHvwpQzwZ8SMUh2wT2/ReO5sjvuDaI/B+cY1gZ6XpXQ6XCem9CwIky4BsT4RBfS2lGK5nXD4t/RyBycV7odznvKcAAA==",
    "alt": "An equirectangular view of a snow-covered mountain valley.",
    "altStatus": "draft",
    "capturedAt": "2022-03-20T07:36:06.000Z",
    "exif": {
      "camera": "realme RMX3370"
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "panorama-360",
      "sourceWidth": 8704,
      "sourceHeight": 4352,
      "sourceBytes": 8422098,
      "generatedBytes": {
        "thumb": 11506,
        "grid": 128280,
        "panorama": 7544066,
        "poster": 209590
      }
    }
  },
  {
    "id": "pxl-20220715-173241364-photosphere-295d2fce",
    "no": "13",
    "type": "panorama360",
    "thumbSrc": "/photos/generated/pxl-20220715-173241364-photosphere-295d2fce/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20220715-173241364-photosphere-295d2fce/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20220715-173241364-photosphere-295d2fce/panorama-poster.webp",
    "posterSrc": "/photos/generated/pxl-20220715-173241364-photosphere-295d2fce/panorama-poster.webp",
    "panoramaSrc": "/photos/generated/pxl-20220715-173241364-photosphere-295d2fce/panorama.jpg",
    "width": 8704,
    "height": 4352,
    "aspectRatio": 2,
    "orientation": "panorama",
    "dominantColor": "#585858",
    "blurDataURL": "data:image/webp;base64,UklGRqYAAABXRUJQVlA4IJoAAABQBACdASogABQAPxFysFAsJqSisAgBgCIJYwDGQBb5/DpNw4c8O/rrlZ2AAPhfCzt2LkahWlQICneIxIJhgBMwXN7Mx8jLAsagbCUCwSWT0Ccowb0EwFiVOwIFvhClrZ0Sd2LarzDBa2mmldxX+Q9oau7XP/X42cfNPJpQse0HWvH1RtdaGQyDcbccP8C8DuK6WPkvRmxij7AA",
    "alt": "An equirectangular view of a covered pavilion and surrounding garden.",
    "altStatus": "draft",
    "capturedAt": "2022-07-15T12:02:41.000Z",
    "exif": {
      "camera": "realme RMX3370"
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "panorama-360",
      "sourceWidth": 8704,
      "sourceHeight": 4352,
      "sourceBytes": 9204371,
      "generatedBytes": {
        "thumb": 12964,
        "grid": 140872,
        "panorama": 8535710,
        "poster": 239560
      }
    }
  },
  {
    "id": "pxl-20260404-023940231-205c1eac",
    "no": "14",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260404-023940231-205c1eac/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260404-023940231-205c1eac/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260404-023940231-205c1eac/viewer.webp",
    "width": 6144,
    "height": 8160,
    "aspectRatio": 0.752941,
    "orientation": "portrait",
    "dominantColor": "#98a8a8",
    "blurDataURL": "data:image/webp;base64,UklGRpwAAABXRUJQVlA4IJAAAABQBQCdASoYACAAPxF0s1KsJqSisBgIAYAiCUATpmRl9UC74XEh7p22B6ZnbtVLDcei7gAA/cn736udGJtKn3gstx/AXqiRmVPKyzpQJiNt9m3V60oVXdtEDXZHaDOqVirgC3PWi3KQU/H8JnQDsRA/k5A/Sh4DWOwXaXR/DSoc9P59kBqTgxx5/0pCfzWoAAA=",
    "alt": "A woman in a pink dress holds a child while standing at the edge of the sea.",
    "altStatus": "draft",
    "capturedAt": "2026-04-04T02:39:40.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 17.906mm f/2.8",
      "focalLength": "17.9 mm",
      "aperture": "f/2.8",
      "shutterSpeed": "1/1529s",
      "iso": 49
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 6144,
      "sourceHeight": 8160,
      "sourceBytes": 5918975,
      "generatedBytes": {
        "thumb": 6440,
        "grid": 83652,
        "viewer": 406992
      }
    }
  },
  {
    "id": "pxl-20260405-073609554-3-a8525de3",
    "no": "15",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260405-073609554-3-a8525de3/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260405-073609554-3-a8525de3/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260405-073609554-3-a8525de3/viewer.webp",
    "width": 4324,
    "height": 3459,
    "aspectRatio": 1.250072,
    "orientation": "landscape",
    "dominantColor": "#78a8d8",
    "blurDataURL": "data:image/webp;base64,UklGRvQAAABXRUJQVlA4IOgAAADwBQCdASogABoAPxF0tFKsJiUisBgIAYAiCWwAtSFAFaADxLv9vaX5vXHFUa4OkNnCQFIugZI+hAD8UwjvPBETsv5yhDE3LEkyycEOV5mmCh9xP321Rn9Uiw3bpR0rwlnjV0kDXi/smg3XZDI3suisx1d4voA+A8NCCKthDH0q0ijK+9VlpWNL2dYb+ZFiM8bY22U3TNOrr1/cKn9axFOWnFyuXdyfrgDMiiCY0JhqO5fJldXFYVjUuvRyDXzEp3NviSIojrQ5Q+UEWXqltLlDr0W2Bmo/9i3bZDdvdjTfgxvEQBwAAAAA",
    "alt": "An ornate sandstone building rises beyond clipped hedges beneath a blue sky.",
    "altStatus": "draft",
    "capturedAt": "2026-04-05T07:36:09.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 6.9mm f/1.68",
      "focalLength": "6.9 mm",
      "aperture": "f/1.7",
      "shutterSpeed": "1/1400s",
      "iso": 20
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 4324,
      "sourceHeight": 3459,
      "sourceBytes": 7187734,
      "generatedBytes": {
        "thumb": 15408,
        "grid": 270872,
        "viewer": 1280524
      }
    }
  },
  {
    "id": "pxl-20260405-091811223-raw-02-original-0c955e1d",
    "no": "16",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260405-091811223-raw-02-original-0c955e1d/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260405-091811223-raw-02-original-0c955e1d/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260405-091811223-raw-02-original-0c955e1d/viewer.webp",
    "width": 1928,
    "height": 2560,
    "aspectRatio": 0.753125,
    "orientation": "portrait",
    "dominantColor": "#a8a8b8",
    "blurDataURL": "data:image/webp;base64,UklGRgIBAABXRUJQVlA4IPYAAAAQBwCdASoYACAAPxFwrlAsJiQisAgBgCIJbACsMuu6Jn/0wBQABf6xmkWCFn0t1lBVmEwCdnHJG/Zww+ShdwU5gAD+UnHW+ShnEhDowFrH8Pfotsg+DMkYE5Yixe+3VXO93PbW/D09+0TeYiljm5ncgZWy+It+5c25CLQj9gt8ue75JEPMXlD0Hnkk9uECW6o4l+ezhqPji3jwzTU/9cqbbbsYRcmc15Pe92rSC0ni8ArwuUWEjFwQIERsTMUTj3RUVatsa7YZ10+FTdI0zB/ZnySZsnocCMF5R5yEB3zjR5o58CGUVEb38vkDXNaOSqVXA55xmAA=",
    "alt": "A man wearing a vivid red turban holds a wooden staff.",
    "altStatus": "draft",
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "raw-dng",
      "sourceWidth": 2560,
      "sourceHeight": 1928,
      "sourceBytes": 40264338,
      "generatedBytes": {
        "thumb": 11918,
        "grid": 123048,
        "viewer": 494980
      }
    }
  },
  {
    "id": "pxl-20260405-130246834-1-2bf2c47a",
    "no": "17",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260405-130246834-1-2bf2c47a/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260405-130246834-1-2bf2c47a/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260405-130246834-1-2bf2c47a/viewer.webp",
    "width": 5807,
    "height": 7260,
    "aspectRatio": 0.799862,
    "orientation": "portrait",
    "dominantColor": "#6898b8",
    "blurDataURL": "data:image/webp;base64,UklGRtgAAABXRUJQVlA4IMwAAABQBQCdASoaACAAPxF2slGsJySiqA1RgCIJagCdMoM6AIm1gsgWaxU1rBNo9+uE1eUTZJAA+bda4ND79lrgmPdUCLk+95ld0poK4Z7auwhekdPEWvKxH1d0kxvUvQyhfO1T9mvrXRF253UmJIbaYyhht6ajgzRPnePPT3zTrAS0rJ/DBtZGPpgzS1lSU1w+y8WaFmTXA0FntqYdw0TQZ7E9U3bt5gZXYpa6Mjxem8Yxf3h5nPFD8b/Gbqg73COKbDtIbm/2IHRBZFIAAAA=",
    "alt": "A child sits in beach sand beneath a blue evening sky.",
    "altStatus": "draft",
    "capturedAt": "2026-04-05T13:02:46.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 2.02mm f/1.7",
      "focalLength": "2 mm",
      "aperture": "f/1.7",
      "shutterSpeed": "1/7000s",
      "iso": 51
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 5807,
      "sourceHeight": 7260,
      "sourceBytes": 10181265,
      "generatedBytes": {
        "thumb": 9144,
        "grid": 87492,
        "viewer": 433728
      }
    }
  },
  {
    "id": "pxl-20260406-042500837-3-29db9ac7",
    "no": "18",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260406-042500837-3-29db9ac7/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260406-042500837-3-29db9ac7/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260406-042500837-3-29db9ac7/viewer.webp",
    "width": 6144,
    "height": 7680,
    "aspectRatio": 0.8,
    "orientation": "portrait",
    "dominantColor": "#78a8e8",
    "blurDataURL": "data:image/webp;base64,UklGRqgAAABXRUJQVlA4IJwAAADwBACdASoaACAAPwlsrVArpaQit/VYAXAhCWwAnTLev2BoAH62GlKcs7EnHur8m6gA1oaKvVUfONtGrwGCWcxdSp1oL4sbGV8MfxRavi+vNSPxK+YEy1VeJaox1tgujfpoIMloXDqjHUNDkLS+N2YwihBOqggGNyrhTEIeGnsGlZhFuHZ/ThlbRJ1yOpJYN1PkmNTNI50DoqvuIAA=",
    "alt": "A carved stone temple spire rises into a clear blue sky beneath a red-and-yellow flag.",
    "altStatus": "draft",
    "capturedAt": "2026-04-06T04:25:00.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 17.906mm f/2.8",
      "focalLength": "17.9 mm",
      "aperture": "f/2.8",
      "shutterSpeed": "1/1050s",
      "iso": 39
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 6144,
      "sourceHeight": 7680,
      "sourceBytes": 10570607,
      "generatedBytes": {
        "thumb": 8668,
        "grid": 120484,
        "viewer": 558604
      }
    }
  },
  {
    "id": "pxl-20260406-130441622-raw-02-original-d6804b0f",
    "no": "19",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260406-130441622-raw-02-original-d6804b0f/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260406-130441622-raw-02-original-d6804b0f/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260406-130441622-raw-02-original-d6804b0f/viewer.webp",
    "width": 5448,
    "height": 7240,
    "aspectRatio": 0.752486,
    "orientation": "portrait",
    "dominantColor": "#f8f8f8",
    "blurDataURL": "data:image/webp;base64,UklGRrAAAABXRUJQVlA4IKQAAAAwBQCdASoYACAAPxF8tFQsJ6SjKAqpgCIJQBdkLdE/3n0Mk+m/su16b3BfLHS+F1PuAAD+5k8FgkppV5LLtf1PmfgKCnZRzN3iMvp640cM3W1/GGExUhZ8xHC/U/8qLJkWABSPfJziDU1ayDj1QDCmm07FVKZxg5BVbk88i3lqwcrX/xxdDSJq9feBLfzHt/yFUTr9aVsbH7crtsWGXkkM1yUAAA==",
    "alt": "A person stands on a rocky sea cliff above breaking waves.",
    "altStatus": "draft",
    "capturedAt": "2026-04-06T13:04:41.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 17.9mm f/2.8",
      "focalLength": "17.9 mm",
      "aperture": "f/2.8",
      "shutterSpeed": "1/180s",
      "iso": 47
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 5448,
      "sourceHeight": 7240,
      "sourceBytes": 10656309,
      "generatedBytes": {
        "thumb": 9606,
        "grid": 119760,
        "viewer": 577208
      }
    }
  },
  {
    "id": "pxl-20260406-133217115-raw-01-1-13c9267b",
    "no": "20",
    "type": "photo",
    "thumbSrc": "/photos/generated/pxl-20260406-133217115-raw-01-1-13c9267b/thumb.webp",
    "gridSrc": "/photos/generated/pxl-20260406-133217115-raw-01-1-13c9267b/grid.webp",
    "viewerSrc": "/photos/generated/pxl-20260406-133217115-raw-01-1-13c9267b/viewer.webp",
    "width": 6099,
    "height": 7624,
    "aspectRatio": 0.799974,
    "orientation": "portrait",
    "dominantColor": "#c8b8a8",
    "blurDataURL": "data:image/webp;base64,UklGRpQAAABXRUJQVlA4IIgAAAAQBACdASoaACAAPxF6r1MsJ6OiqA1RgCIJZVefUWMXD0DHWoh7fj/YgAD3JsloFA+4nu/1ciqzw46aDNrzuJ5JiXodpmoS7lIMDGbrSRmFXjRpvJHoiyQAbZjKYxee1ntkSViD1kKPeXEvaG0Gg1mAdBDB1MhkT+QOW7+1dFjcjIuZiNhtAAAA",
    "alt": "A small boat crosses a hazy sea beneath a pale orange sky.",
    "altStatus": "draft",
    "capturedAt": "2026-04-06T13:32:17.000Z",
    "exif": {
      "camera": "Google Pixel 10 Pro",
      "lens": "Pixel 10 Pro back camera 17.906mm f/2.8",
      "focalLength": "17.9 mm",
      "aperture": "f/2.8",
      "shutterSpeed": "1/190s",
      "iso": 151
    },
    "categories": [],
    "tags": [],
    "processing": {
      "profileVersion": 1,
      "sourceType": "standard-raster",
      "sourceWidth": 6099,
      "sourceHeight": 7624,
      "sourceBytes": 12185897,
      "generatedBytes": {
        "thumb": 10148,
        "grid": 159476,
        "viewer": 824160
      }
    }
  }
] as const satisfies readonly PhotoAsset[];

export const hiddenPhotoId = "pxl-20260406-133217115-raw-01-1-13c9267b";
