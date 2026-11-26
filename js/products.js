/* Mitsy Beauty — product catalogue
   Shade names and hex values come from the brand guidelines (swatches on the Lip Stain boxes).
   Prices are SAMPLE figures for the demo checkout only — not confirmed retail prices.
   stripeLink is reserved for later; it is unused while the demo cart is in place.
*/
(function (root) {
  "use strict";

  root.MITSY = {
    currency: "USD",
    samplePrice: 24,
    samplePriceNote: "Sample price",
    demoNotice: "Demo checkout, no payment is taken",
    shipping: [
      { id: "standard", name: "Standard", price: 5, note: "Sample rate" },
      { id: "express", name: "Express", price: 12, note: "Sample rate" }
    ]
  };

  root.MITSY_PRODUCTS = [
    {
      id: "amber-silk",
      name: "Amber Silk",
      shadeNumber: "01",
      price: 24,
      priceIsSample: true,
      color: "#B5502F",
      image: "img/bottle-1.webp",
      imagePng: "img/bottle-1.png",
      imageWidth: 199,
      imageHeight: 470,
      swatch: "img/swatch-1.webp",
      swatchPng: "img/swatch-1.png",
      stripeLink: "",
      alt: "Mitsy Beauty Amber Silk lip stain bottle with a pink cap"
    },
    {
      id: "rose-velour",
      name: "Rose Velour",
      shadeNumber: "02",
      price: 24,
      priceIsSample: true,
      color: "#A5363B",
      image: "img/bottle-2.webp",
      imagePng: "img/bottle-2.png",
      imageWidth: 203,
      imageHeight: 470,
      swatch: "img/swatch-2.webp",
      swatchPng: "img/swatch-2.png",
      stripeLink: "",
      alt: "Mitsy Beauty Rose Velour lip stain bottle with a pink cap"
    },
    {
      id: "cocoa-noir",
      name: "Cocoa Noir",
      shadeNumber: "03",
      price: 24,
      priceIsSample: true,
      color: "#4C1A08",
      image: "img/bottle-3.webp",
      imagePng: "img/bottle-3.png",
      imageWidth: 203,
      imageHeight: 467,
      swatch: "img/swatch-3.webp",
      swatchPng: "img/swatch-3.png",
      stripeLink: "",
      alt: "Mitsy Beauty Cocoa Noir lip stain bottle with a pink cap"
    },
    {
      id: "berry-couture",
      name: "Berry Couture",
      shadeNumber: "04",
      price: 24,
      priceIsSample: true,
      color: "#B02434",
      image: "img/bottle-4.webp",
      imagePng: "img/bottle-4.png",
      imageWidth: 215,
      imageHeight: 376,
      swatch: "img/swatch-4.webp",
      swatchPng: "img/swatch-4.png",
      stripeLink: "",
      alt: "Open Mitsy Beauty Berry Couture lip stain bottle"
    }
  ];

  root.mitsyProduct = function (id) {
    for (var i = 0; i < root.MITSY_PRODUCTS.length; i++) {
      if (root.MITSY_PRODUCTS[i].id === id) return root.MITSY_PRODUCTS[i];
    }
    return null;
  };

  root.mitsyMoney = function (amount) {
    var n = Number(amount) || 0;
    return "$" + n.toFixed(2);
  };
})(window);
