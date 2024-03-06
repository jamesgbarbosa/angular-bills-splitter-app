import { Pipe, PipeTransform } from "@angular/core";

@Pipe({name: 'abs', standalone: true})

export class AbsPipe implements PipeTransform {
  transform(num: any, args?: any): any {
    return Math.abs(num);
  }
}