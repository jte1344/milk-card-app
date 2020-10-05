export class Order {
  classID: string;
  className: string;
  students: {
    id: number,
    name: string,
    choice: string
  };
  drinks: {
    milk: number,
    water: number,
    chocoMilk: number
  };
}
