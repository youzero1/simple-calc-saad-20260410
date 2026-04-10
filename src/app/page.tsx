'use client';

import { useState, useEffect, useCallback } from 'react';
import styles from './page.module.css';

interface HistoryItem {
  id: number;
  num1: number;
  num2: number;
  operator: string;
  result: string;
  createdAt: string;
}

export default function Home() {
  const [display, setDisplay] = useState('0');
  const [num1, setNum1] = useState<number | null>(null);
  const [operator, setOperator] = useState<string | null>(null);
  const [waitingForNum2, setWaitingForNum2] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = useCallback(async () => {
    try {
      const res = await fetch('/api/history');
      const data = await res.json();
      if (data.history) {
        setHistory(data.history);
      }
    } catch (err) {
      console.error('Failed to fetch history:', err);
    }
  }, []);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleNumber = (num: string) => {
    setError(null);
    if (waitingForNum2) {
      setDisplay(num);
      setWaitingForNum2(false);
    } else {
      setDisplay((prev) => (prev === '0' ? num : prev + num));
    }
  };

  const handleDecimal = () => {
    setError(null);
    if (waitingForNum2) {
      setDisplay('0.');
      setWaitingForNum2(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay((prev) => prev + '.');
    }
  };

  const handleOperator = (op: string) => {
    setError(null);
    const currentNum = parseFloat(display);
    if (num1 !== null && !waitingForNum2) {
      // Chain operations
      handleEquals(currentNum, op);
    } else {
      setNum1(currentNum);
      setOperator(op);
      setWaitingForNum2(true);
    }
  };

  const handleEquals = async (chainNum?: number, chainOp?: string) => {
    const n1 = chainNum !== undefined ? num1! : num1;
    const n2 = chainNum !== undefined ? parseFloat(display) : parseFloat(display);
    const op = operator;

    if (n1 === null || op === null) return;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ num1: n1, num2: n2, operator: op }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
        setDisplay('Error');
      } else {
        setDisplay(data.result);
        if (chainOp) {
          setNum1(parseFloat(data.result));
          setOperator(chainOp);
          setWaitingForNum2(true);
        } else {
          setNum1(null);
          setOperator(null);
          setWaitingForNum2(false);
        }
        await fetchHistory();
      }
    } catch (err) {
      console.error('Calculate failed:', err);
      setError('Calculation failed');
      setDisplay('Error');
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setNum1(null);
    setOperator(null);
    setWaitingForNum2(false);
    setError(null);
  };

  const getOperatorSymbol = (op: string) => {
    switch (op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
      default: return op;
    }
  };

  const formatDisplay = (val: string) => {
    if (val.length > 12) return parseFloat(val).toExponential(4);
    return val;
  };

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <h1 className={styles.title}>Calculator</h1>

        <div className={styles.calculator}>
          {/* Display */}
          <div className={styles.display}>
            <div className={styles.expression}>
              {num1 !== null && operator
                ? `${num1} ${getOperatorSymbol(operator)}`
                : ''}
            </div>
            <div
              className={styles.currentValue}
              style={{ color: error ? '#ff6b6b' : '#fff' }}
            >
              {error ? 'Error' : formatDisplay(display)}
            </div>
            {error && <div className={styles.errorMsg}>{error}</div>}
          </div>

          {/* Buttons */}
          <div className={styles.buttons}>
            {/* Row 1 */}
            <button
              className={`${styles.btn} ${styles.btnClear}`}
              onClick={handleClear}
              style={{ gridColumn: 'span 2' }}
            >
              AC
            </button>
            <button
              className={`${styles.btn} ${styles.btnOperator}`}
              onClick={() => {
                setDisplay((prev) =>
                  prev.startsWith('-') ? prev.slice(1) : '-' + prev
                );
              }}
            >
              +/−
            </button>
            <button
              className={`${styles.btn} ${styles.btnOperator}`}
              onClick={() => handleOperator('/')}
            >
              ÷
            </button>

            {/* Row 2 */}
            <button className={styles.btn} onClick={() => handleNumber('7')}>7</button>
            <button className={styles.btn} onClick={() => handleNumber('8')}>8</button>
            <button className={styles.btn} onClick={() => handleNumber('9')}>9</button>
            <button
              className={`${styles.btn} ${styles.btnOperator}`}
              onClick={() => handleOperator('*')}
            >
              ×
            </button>

            {/* Row 3 */}
            <button className={styles.btn} onClick={() => handleNumber('4')}>4</button>
            <button className={styles.btn} onClick={() => handleNumber('5')}>5</button>
            <button className={styles.btn} onClick={() => handleNumber('6')}>6</button>
            <button
              className={`${styles.btn} ${styles.btnOperator}`}
              onClick={() => handleOperator('-')}
            >
              −
            </button>

            {/* Row 4 */}
            <button className={styles.btn} onClick={() => handleNumber('1')}>1</button>
            <button className={styles.btn} onClick={() => handleNumber('2')}>2</button>
            <button className={styles.btn} onClick={() => handleNumber('3')}>3</button>
            <button
              className={`${styles.btn} ${styles.btnOperator}`}
              onClick={() => handleOperator('+')}
            >
              +
            </button>

            {/* Row 5 */}
            <button
              className={styles.btn}
              onClick={() => handleNumber('0')}
              style={{ gridColumn: 'span 2' }}
            >
              0
            </button>
            <button className={styles.btn} onClick={handleDecimal}>.</button>
            <button
              className={`${styles.btn} ${styles.btnEquals}`}
              onClick={() => handleEquals()}
              disabled={loading}
            >
              {loading ? '...' : '='}
            </button>
          </div>
        </div>

        {/* History */}
        <div className={styles.historyContainer}>
          <h2 className={styles.historyTitle}>Calculation History</h2>
          {history.length === 0 ? (
            <p className={styles.noHistory}>No calculations yet.</p>
          ) : (
            <ul className={styles.historyList}>
              {history.map((item) => (
                <li key={item.id} className={styles.historyItem}>
                  <span className={styles.historyExpression}>
                    {item.num1} {getOperatorSymbol(item.operator)} {item.num2}
                  </span>
                  <span className={styles.historyEquals}>=</span>
                  <span className={styles.historyResult}>{item.result}</span>
                  <span className={styles.historyDate}>
                    {new Date(item.createdAt).toLocaleTimeString()}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </main>
  );
}
