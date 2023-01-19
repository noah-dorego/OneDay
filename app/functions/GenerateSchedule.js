const generateSchedule = (currentSchedule, startTime, endTime) => {
    var newSchedule = [];
    var addFlag = false;

    currentSchedule.map((item) => {
        if (item.time === startTime) {
            addFlag = true;
            newSchedule.push(item);
        } else if (addFlag === true && item.time === endTime) {
            newSchedule.push(item);
            addFlag = false;
        } else if (addFlag === true) {
            newSchedule.push(item);
        }
    })

    return newSchedule;
}

export default generateSchedule;