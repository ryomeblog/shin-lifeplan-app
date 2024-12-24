// 使用例
const { compressJSON, decompressJSON } = require("./index");

// const testData = {
//   items: Array.from({ length: 1000 }, (_, i) => ({
//     id: i,
//     name: "テストアイテム",
//     description: "これは長い説明文です。".repeat(10),
//   })),
// };
const testData = {
  company: {
    name: "Tech Innovators Inc.",
    location: "Tokyo, Japan",
    partners: [
      {
        partner_id: 301,
        name: "Global Tech Solutions",
        industry: "IT Services",
        contact: {
          name: "Alice Johnson",
          email: "alice.johnson@globaltech.com",
          phone: "+1-555-123-4567",
        }
      },
      {
        partner_id: 302,
        name: "Innovative Fintech Ltd.",
        industry: "Financial Technology",
        contact: {
          name: "Bob Smith",
          email: "bob.smith@innovativefintech.com",
          phone: "+44-20-1234-5678",
        },
      }
    ]
  }
};

compressJSON(testData)
  .then((compressed) => {
    console.log("元のサイズ:", JSON.stringify(testData).length);
    console.log("圧縮後のサイズ:", compressed.length);
    console.log("圧縮後の文字列:", compressed);
    return decompressJSON(compressed);
  })
  .then((decompressed) => {
    console.log("正常に解凍できました");
  });
