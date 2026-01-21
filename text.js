const myArray = [1, 2, 3, 4, 5];

function sumArray (array){
    const sum = array.reduce((acc, num)=> acc+num, 0)
    console.log(sum)
}
sumArray(myArray);
