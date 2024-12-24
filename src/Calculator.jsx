import React, { useState, useEffect, useCallback } from 'react';
import History from './HistoryPanel';

const Calculator = () => {
  const [currentNumber, setCurrentNumber] = useState('0');
  const [previousNumber, setPreviousNumber] = useState('');
  const [operation, setOperation] = useState('');
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [isScientific, setIsScientific] = useState(false);
  const [activeKey, setActiveKey] = useState(null);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('calculatorTheme');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  useEffect(() => {
    localStorage.setItem('calculatorTheme', JSON.stringify(isDarkMode));
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // Load history from localStorage on component mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('calculatorHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('calculatorHistory', JSON.stringify(history));
  }, [history]);

  // Scientific mode key mappings
  const scientificKeyMap = {
    's': 'sin',
    'c': 'cos',
    't': 'tan',
    'r': 'sqrt',
    'l': 'log',
    'n': 'ln',
    'p': 'pi',
    'e': 'e',
  };


  const handleNumber = (number) => {
    setError('');
    
    // Handle decimal point
    if (number === '.') {
      if (currentNumber.includes('.')) return;
      setCurrentNumber(currentNumber + '.');
      return;
    }

    // Handle numbers
    if (currentNumber === '0') {
      setCurrentNumber(number);
    } else {
      setCurrentNumber(currentNumber + number);
    }
  };

  const handleOperator = (operator) => {
    setError('');

    // If we already have a previous operation pending, calculate it first
    if (previousNumber && currentNumber && operation) {
      calculate();
      // After calculation, set up for next operation
      setPreviousNumber(currentNumber);
      setCurrentNumber('0');
      setOperation(operator);
      return;
    }

    // Set up new operation
    setPreviousNumber(currentNumber);
    setCurrentNumber('0');
    setOperation(operator);
  };

  const handleScientificOperation = (operation) => {
    try {
      let result;
      const current = parseFloat(currentNumber);

      switch (operation) {
        case 'sin':
          result = Math.sin(current * (Math.PI / 180));
          break;
        case 'cos':
          result = Math.cos(current * (Math.PI / 180));
          break;
        case 'tan':
          result = Math.tan(current * (Math.PI / 180));
          break;
        case 'sqrt':
          if (current < 0) throw new Error('Invalid input for square root');
          result = Math.sqrt(current);
          break;
        case 'square':
          result = Math.pow(current, 2);
          break;
        case 'cube':
          result = Math.pow(current, 3);
          break;
        case 'log':
          if (current <= 0) throw new Error('Invalid input for logarithm');
          result = Math.log10(current);
          break;
        case 'ln':
          if (current <= 0) throw new Error('Invalid input for natural logarithm');
          result = Math.log(current);
          break;
        case '1/x':
          if (current === 0) throw new Error('Cannot divide by zero');
          result = 1 / current;
          break;
        case '+/-':
          result = current * -1;
          break;
        default:
          return;
      }

      if (!Number.isFinite(result)) {
        throw new Error('Result is undefined');
      }

      result = Number(result.toFixed(8));
      
      const calculationEntry = {
        id: Date.now(),
        calculation: `${operation}(${currentNumber})`,
        result: result.toString(),
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [calculationEntry, ...prev]);
      setCurrentNumber(result.toString());

    } catch (err) {
      setError(err.message);
      setCurrentNumber('0');
    }
  };

  const calculate = () => {
    if (!previousNumber || !currentNumber || !operation) return;

    let result;
    const prev = parseFloat(previousNumber);
    const current = parseFloat(currentNumber);

    try {
      switch (operation) {
        case '+':
          result = prev + current;
          break;
        case '-':
          result = prev - current;
          break;
        case '*':
          result = prev * current;
          break;
        case '/':
          if (current === 0) {
            throw new Error('Cannot divide by zero');
          }
          result = prev / current;
          break;
        default:
          return;
      }

      if (!Number.isFinite(result)) {
        throw new Error('Result is too large');
      }

      result = Number(parseFloat(result.toFixed(8)));
      
      const calculationEntry = {
        id: Date.now(),
        calculation: `${previousNumber} ${operation} ${currentNumber}`,
        result: result.toString(),
        timestamp: new Date().toLocaleString()
      };
      setHistory(prev => [calculationEntry, ...prev]);

      setCurrentNumber(result.toString());
      setPreviousNumber('');
      setOperation('');
    } catch (err) {
      setError(err.message);
      setCurrentNumber('0');
      setPreviousNumber('');
      setOperation('');
    }
  };

  const handleEqual = () => {
    if (!operation || !previousNumber) return;
    calculate();
  };

  const handleClear = () => {
    setCurrentNumber('0');
    setPreviousNumber('');
    setOperation('');
    setError('');
  };

  const handleBackspace = () => {
    if (error) {
      setError('');
      setCurrentNumber('0');
      return;
    }

    if (currentNumber.length === 1) {
      setCurrentNumber('0');
    } else {
      setCurrentNumber(currentNumber.slice(0, -1));
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('calculatorHistory');
  };

  const deleteHistoryItem = (id) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const useCalculation = (result) => {
    setCurrentNumber(result);
    setPreviousNumber('');
    setOperation('');
    setShowHistory(false);
  };

  // Helper function to determine if a button is active
  const isButtonActive = (buttonValue) => {
    if (!activeKey) return false;
    if (buttonValue === activeKey) return true;
    if (isScientific && buttonValue === scientificKeyMap[activeKey.toLowerCase()]) return true;
    return false;
  };

  // Button component with active state
  const CalculatorButton = ({ value, onClick, className, children }) => (
    <button
      onClick={onClick}
      className={`${className} ${
        isButtonActive(value) 
          ? 'ring-2 ring-white ring-opacity-60 transform scale-95' 
          : ''
      } transition-all duration-100`}
    >
      {children}
    </button>
  );

  if (showHistory) {
    return (
      <History 
        history={history}
        clearHistory={clearHistory}
        deleteHistoryItem={deleteHistoryItem}
        useCalculation={useCalculation}
        onBack={() => setShowHistory(false)}
      />
    );
  }


  useEffect(() => {
    const handleKeyPress = (event) => {
      const key = event.key;
  
      // Prevent default actions for specific keys
      if (['Enter', '=', 'Escape'].includes(key)) {
        event.preventDefault();
      }
  
      // Toggle shortcuts help
      if (key.toLowerCase() === 'h') {
        setShowShortcuts((prev) => !prev);
        return;
      }
  
      // Visual feedback
      setActiveKey(key);
      setTimeout(() => setActiveKey(null), 100);
  
      // Handle numeric input and decimal point
      if (/^[0-9.]$/.test(key)) {
        handleNumber(key);
        return;
      }
  
      // Handle operators
      if (['+', '-', '*', '/'].includes(key)) {
        handleOperator(key);
        return;
      }
  
      // Handle special keys
      switch (key) {
        case 'Enter':
        case '=':
          handleEqual();
          break;
        case 'Backspace':
          handleBackspace();
          break;
        case 'Escape':
          handleClear();
          break;
        default:
          // Handle scientific operations if in scientific mode
          if (isScientific && scientificKeyMap[key.toLowerCase()]) {
            handleScientificOperation(scientificKeyMap[key.toLowerCase()]);
          }
      }
    };
  
    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [handleNumber, handleOperator, handleEqual, handleBackspace, handleClear, handleScientificOperation, isScientific]);
  

  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      isDarkMode 
        ? 'bg-gradient-to-br from-gray-900 to-gray-800' 
        : 'bg-gradient-to-br from-blue-50 to-gray-100'
    }`}>
      
      {/* Header with Logo and Theme Toggle */}
      <div className="w-full px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <svg 
            className={`h-8 w-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" 
            />
          </svg>
          <h1 className={`text-2xl font-bold ${
            isDarkMode ? 'text-white' : 'text-gray-800'
          }`}>
            CalcMaster Pro
          </h1>
        </div>
        
        {/* Theme Toggle Button */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isDarkMode 
              ? 'bg-gray-700 text-yellow-400 hover:bg-gray-600' 
              : 'bg-white text-gray-800 hover:bg-gray-100'
          } shadow-lg`}
          aria-label="Toggle theme"
        >
          {isDarkMode ? (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" 
              />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" 
              />
            </svg>
          )}
        </button>
      </div>
  
      {/* Main Calculator Container */}
      <div className="flex items-center justify-center p-4">
        <div className={`w-full max-w-md p-6 rounded-2xl shadow-2xl transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-gray-800/50 backdrop-blur-lg' 
            : 'bg-white/80 backdrop-blur-lg'
        }`}>
          {/* Display Section */}
          <div className={`p-6 rounded-xl mb-6 shadow-inner transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-900' 
              : 'bg-gradient-to-r from-blue-600 to-blue-700'
          }`}>
            <div className="flex justify-between items-center mb-2">
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowHistory(true)}
                  className="text-gray-300 hover:text-white transition-colors text-sm flex items-center gap-2"
                  aria-label="Show history"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button 
                  onClick={() => setIsScientific(!isScientific)}
                  className={`text-sm font-medium transition-colors ${
                    isScientific 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-gray-300 hover:text-white'
                  }`}
                >
                  {isScientific ? 'Basic' : 'Scientific'}
                </button>
              </div>
              <div className="text-gray-300 text-right font-medium tracking-wider overflow-hidden">
                {previousNumber} {operation} {currentNumber !== '0' ? currentNumber : ''}
              </div>
            </div>
            <div className="text-white text-right text-4xl font-bold h-12 overflow-hidden transition-all">
              {error || currentNumber}
            </div>
          </div>
  
          {/* Scientific Mode Buttons */}
          {isScientific && (
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: 'sin', op: 'sin' },
                { label: 'cos', op: 'cos' },
                { label: 'tan', op: 'tan' },
                { label: '√', op: 'sqrt' },
                { label: 'x²', op: 'square' },
                { label: 'x³', op: 'cube' },
                { label: 'log', op: 'log' },
                { label: 'ln', op: 'ln' },
                { label: '1/x', op: '1/x' },
                { label: '+/-', op: '+/-' },
                { label: 'π', op: 'pi' },
                { label: 'e', op: 'e' }
              ].map((btn) => (
                <CalculatorButton
                  key={btn.op}
                  value={btn.op}
                  onClick={() => {
                    if (btn.op === 'pi') {
                      setCurrentNumber(Math.PI.toString());
                    } else if (btn.op === 'e') {
                      setCurrentNumber(Math.E.toString());
                    } else {
                      handleScientificOperation(btn.op);
                    }
                  }}
                  className={`${isDarkMode 
                    ? 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800' 
                    : 'bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700'
                  } text-white p-3 rounded-xl font-medium text-sm shadow-lg active:scale-95 transition-all`}
                >
                  {btn.label}
                </CalculatorButton>
              ))}
            </div>
          )}
  
          {/* Calculator Buttons */}
          <div className="grid grid-cols-4 gap-3">
            {/* Clear and Backspace */}
            <CalculatorButton 
              value="clear"
              onClick={handleClear}
              className={`col-span-2 text-white p-5 rounded-xl font-semibold text-lg shadow-lg 
                active:scale-95 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800' 
                  : 'bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700'
              }`}
            >
              AC
            </CalculatorButton>
            <CalculatorButton 
              value="backspace"
              onClick={handleBackspace}
              className={`text-white p-5 rounded-xl font-semibold text-lg shadow-lg 
                active:scale-95 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900' 
                  : 'bg-gradient-to-r from-gray-600 to-gray-700 hover:from-gray-700 hover:to-gray-800'
              }`}
            >
              ⌫
            </CalculatorButton>
            <CalculatorButton 
              value="/"
              onClick={() => handleOperator('/')}
              className={`text-white p-5 rounded-xl font-semibold text-lg shadow-lg 
                active:scale-95 transition-all ${
                isDarkMode 
                  ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800' 
                  : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
              }`}
            >
              ÷
            </CalculatorButton>
  
            {/* Number Pad */}
            <div className="col-span-3 grid grid-cols-3 gap-3">
              {[7, 8, 9, 4, 5, 6, 1, 2, 3, 0, '.'].map((num) => (
                <CalculatorButton
                  key={num}
                  value={num.toString()}
                  onClick={() => handleNumber(num.toString())}
                  className={`text-lg font-semibold rounded-xl shadow-lg p-5 
                    active:scale-95 transition-all ${
                    isDarkMode 
                      ? 'bg-gray-700 text-white hover:bg-gray-600' 
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 hover:from-gray-200 hover:to-gray-300'
                  }`}
                >
                  {num}
                </CalculatorButton>
              ))}
            </div>
  
            {/* Operators Column */}
            <div className="grid grid-rows-4 gap-3">
              {[
                { symbol: '×', operation: '*' },
                { symbol: '-', operation: '-' },
                { symbol: '+', operation: '+' },
                { symbol: '=', operation: 'equals' }
              ].map((op) => (
                <CalculatorButton 
                  key={op.symbol}
                  value={op.operation}
                  onClick={() => op.operation === 'equals' ? handleEqual() : handleOperator(op.operation)}
                  className={`text-white p-5 rounded-xl font-semibold text-lg shadow-lg 
                    active:scale-95 transition-all ${
                    op.operation === 'equals'
                      ? isDarkMode
                        ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                        : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'
                      : isDarkMode
                        ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800'
                        : 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700'
                  }`}
                >
                  {op.symbol}
                </CalculatorButton>
              ))}
            </div>
          </div>
        </div>
      </div>
  
      {/* Keyboard Shortcuts Modal */}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className={`rounded-xl p-6 max-w-md w-full ${
            isDarkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-800'
          }`}>
            <h2 className="text-xl font-bold mb-4">Keyboard Shortcuts</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold mb-2">Basic Operations</h3>
                <ul className="space-y-1 text-sm">
                  <li>Numbers: 0-9</li>
                  <li>Decimal: .</li>
                  <li>Add: +</li>
                  <li>Subtract: -</li>
                  <li>Multiply: *</li>
                  <li>Divide: /</li>
                  <li>Equal: Enter</li>
                  <li>Clear: Escape</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Scientific Mode</h3>
                <ul className="space-y-1 text-sm">
                  <li>Sin: s</li>
                  <li>Cos: c</li>
                  <li>Tan: t</li>
                  <li>Square Root: r</li>
                  <li>Log: l</li>
                  <li>Ln: n</li>
                  <li>Pi: p</li>
                  <li>Euler's number: e</li>
                </ul>
              </div>
            </div>
            <button 
              onClick={() => setShowShortcuts(false)}
              className={`mt-4 w-full py-2 rounded-lg transition-colors ${
                isDarkMode 
                  ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                  : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
  };

export default Calculator;