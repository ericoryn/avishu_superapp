import { Component } from 'react';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          className="min-h-screen flex items-center justify-center p-6 bg-themed text-themed"
          style={{ transition: 'background-color 0.3s' }}
        >
          <div className="text-center max-w-md space-y-4">
            <p className="font-bold text-xl uppercase tracking-wide">Ошибка интерфейса</p>
            <p className="text-sm text-themed-tertiary font-bold">
              Обновите страницу. Если повторяется — сообщите разработчикам.
            </p>
            <button
              type="button"
              className="border-2 border-themed px-6 py-3 font-bold hover:bg-themed-inverse hover:text-themed-inverse transition-colors btn-brutal"
              onClick={() => window.location.reload()}
            >
              Обновить страницу
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
