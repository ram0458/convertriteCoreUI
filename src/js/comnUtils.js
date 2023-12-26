var riteHeaders = {
  role: "role",
  "X-TENANT-ID": sessionStorage.getItem("X-TENANT-ID"),
  Authorization: sessionStorage.getItem("id_token"),
  userId: sessionStorage.getItem("userId"),
  "Content-Type": "application/json",
};

function getDetails(serName) {
  return new Promise((reslove, reject) => {
    axios
      .get(serName, { headers: riteHeaders })
      .then((response) => {
        reslove(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function postDetails(serName, data) {
  return new Promise((reslove, reject) => {
    axios
      .post(serName, data, { headers: riteHeaders })
      .then((response) => {
        reslove(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function updateDetails(serName, data) {
  return new Promise((reslove, reject) => {
    axios
      .put(serName, data, riteHeaders)
      .then((response) => {
        reslove(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
function delDetails(serName) {
  return new Promise((reslove, reject) => {
    axios
      .delete(serName, { headers: riteHeaders })
      .then((response) => {
        reslove(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

getDetails(riteUTils.riteProps.getVersionData).then((res) => {
  let versionList = [];
  if (res) {
    for (let i = 0; i < res.length; i++) {
      let obj = {
        id: res[i].id,
        value: res[i].value,
        label: res[i].label,
      };

      versionList.push(obj);
    }
    sessionStorage.setItem("version", JSON.stringify(versionList));
  }
});

function hasWhiteSpace(s) {
  return s.indexOf(" ") >= 0;
}

function convertDateFormate(dateVal) {
  if (dateVal) {
    let startTime = new Date(dateVal);
    return new Date(
      startTime.getTime() + startTime.getTimezoneOffset() * 60000
    ).toLocaleString();
  } else {
    return "";
  }
}
