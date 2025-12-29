export function formatDate(date) {
    if (!date) return "";
  
    const indexOfT = date.indexOf("T");
    if (indexOfT !== -1 && indexOfT < date.length - 1) {
      const padStart = (number) => number.toString().padStart(2, "0");
  
      date = new Date(date);
  
      if (padStart(date.getHours()) === "00" && padStart(date.getMinutes()) === "00") {
        return `${padStart(date.getDate())}/${padStart(date.getMonth() + 1)}/${date.getFullYear()}`;
      }
  
      return `${padStart(date.getDate())}/${padStart(date.getMonth() + 1)}/${date.getFullYear()} ${padStart(
        date.getHours()
      )}:${padStart(date.getMinutes())}`;
    }
  
    const [year, month, day] = date.replace("T", "").split("-");
    return `${day}/${month}/${year}`;
  }