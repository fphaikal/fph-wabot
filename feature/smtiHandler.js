const axios = require("axios");
const formatLongDate = require('../utils/getTime');

const smtiApi = axios.create({
  baseURL: "https://api.tierkun.my.id/api",
});

const searchStudent = async (q) => {
  try {
    const responseData = await smtiApi.get(`/siswa/${q}`);
    if (responseData.data.Nama === "NATASHA CHRISTINA PUTRI") {
      return {
        message:
          `Hasil Pencarian:\n\n
          Nama: ${responseData.data.Nama}\n
          Kelas: ${responseData.data.Kelas}\n
          Nomor: ${responseData.data.Nomor || "Belum Minta Nomor Teleponnya"}`,
        error: null,
      };
    } else if(responseData.data.Nama === "NARMADA AQIL ATHALLAH") {
      return {
        message:
        `Hasil Pencarian:\n\nNama: ${responseData.data.Nama}\nNama Ortu: Pepeng\nKelas: ${responseData.data.Kelas}\nNomor: ${responseData.data.Nomor || "Belum Minta Nomor Teleponnya"}`,
        error: null,
      };
    }else if(responseData.data.Nama === "ERLAND AS SAHLAN") {
      return {
        message:
        `Hasil Pencarian:\n\nNama: ${responseData.data.Nama}\nNama Ortu: Edi ❤ Nungki\nKelas: ${responseData.data.Kelas}\nNomor: ${responseData.data.Nomor || "Belum Minta Nomor Teleponnya"}`,
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

const searchOnsite = async(q) => {
  try {
    // Lakukan pemanggilan API untuk mendapatkan data siswa
    const response = await smtiApi.get('/onsite');
    const dataSiswa = response.data;

    // Cari siswa berdasarkan nama yang diinginkan
    const siswaOnsite = dataSiswa.find((siswa) =>
      siswa.Nama.toLowerCase().includes(q.toLowerCase())
    );

    // Jika siswa ditemukan, kirim pesan
    if (siswaOnsite) {
      const pesanSiswaOnsite = `Siswa ${siswaOnsite.Nama} sudah di SMTI.\nWaktu masuk: ${formatLongDate(siswaOnsite.time_enter)}`;
      
      console.log("Pesan pencarian siswa onsite berhasil dikirim:", pesanSiswaOnsite);
      return{ 
        message: `${pesanSiswaOnsite}`,
        error: null,
      }
    } else {
      const pesanSiswaNotOnsite = `Siswa ${q} belum berada di SMTI.`;

      return{ 
        message: `${pesanSiswaNotOnsite}`,
        error: null,
      }
    }
  } catch (error) {
    return{ 
      message: null,
      error: `${error.message}`,
    }
  }
}

module.exports = { searchStudent, searchOnsite };
