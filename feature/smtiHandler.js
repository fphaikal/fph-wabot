const axios = require("axios");

const searchStudent = async (q) => {
  const smtiApi = axios.create({
    baseURL: "https://api.tierkun.my.id/api",
  });
  try {
    const responseData = await smtiApi.get(`/siswa/${q}`);
    if (responseData.data.Nama === "NATASHA CHRISTINA PUTRI") {
      return {
        message:
          `Hasil Pencarian: Test\n\n` +
          "Nama: " +
          responseData.data.Nama +
          `\nKelas: ` +
          responseData.data.Kelas +
          `\nNomor: ${
            responseData.data.Nomor || "Belum Minta Nomor Teleponnya"
          }`,
        error: null,
      };
    } else {
      return {
        message:
          `Hasil Pencarian:\n\n` +
          "Nama: " +
          responseData.data.Nama +
          `\nKelas: ` +
          responseData.data.Kelas +
          `\nNomor: ${
            responseData.data.Nomor || "Belum Minta Nomor Teleponnya"
          }`,
        error: null,
      };
    }
  } catch (error) {
    return {
      message: null,
      error: `Maaf, sepertinya ada yang error : ${error.message}`,
    };
  }
};

module.exports = { searchStudent };
