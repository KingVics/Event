const formDate = async (data) => {
  const date = await new Date(data['Reminder Date']);

  let dateobject = {};
  if (date) {
    const mainTime = await date.toISOString().toString().split('T')[1];
    const mainYear = await date.toISOString().toString().split('T')[0];
    let time = await mainTime.toString().split('.')[0];
    dateobject.year = await mainYear.split('-')[0];
    dateobject.month = await (parseInt(mainYear.split('-')[1]) - 1);
    dateobject.day = await mainYear.split('-')[2];
    dateobject.hour = await time.toString().split(':')[0];
    dateobject.minute = await time.toString().split(':')[1];
    dateobject.seconds = await time.toString().split(':')[2];
  }

  return dateobject;
};

module.exports = formDate;
