import 'reflect-metadata';
import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/datasource';
import { Calculation } from '@/entities/Calculation';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { num1, num2, operator } = body as {
      num1: number;
      num2: number;
      operator: string;
    };

    if (num1 === undefined || num2 === undefined || !operator) {
      return NextResponse.json(
        { error: 'Missing required fields: num1, num2, operator' },
        { status: 400 }
      );
    }

    let result: number;
    let resultStr: string;

    switch (operator) {
      case '+':
        result = num1 + num2;
        resultStr = result.toString();
        break;
      case '-':
        result = num1 - num2;
        resultStr = result.toString();
        break;
      case '*':
        result = num1 * num2;
        resultStr = result.toString();
        break;
      case '/':
        if (num2 === 0) {
          resultStr = 'Error: Division by zero';
        } else {
          result = num1 / num2;
          resultStr = result.toString();
        }
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid operator. Use +, -, *, /' },
          { status: 400 }
        );
    }

    const ds = await getDataSource();
    const repo = ds.getRepository(Calculation);

    const calc = repo.create({
      num1,
      num2,
      operator,
      result: resultStr,
    });

    await repo.save(calc);

    return NextResponse.json({ result: resultStr, id: calc.id });
  } catch (error) {
    console.error('Calculate error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
