import { Component } from 'react';
import { AlertTriangle, RotateCcw, Trash2 } from 'lucide-react';
import { STORAGE_KEY } from '../context/AppContext';

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Noma\'lum xato' };
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleClearData = () => {
    if (!window.confirm("Barcha yutuq va taraqqiyot o'chiriladi. Davom etasizmi?")) return;
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to clear saved data:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200 p-4">
          <div className="card bg-base-100 border border-base-300 shadow-xl max-w-md w-full">
            <div className="card-body items-center text-center">
              <div className="w-16 h-16 rounded-2xl bg-error/10 flex items-center justify-center mb-2">
                <AlertTriangle className="w-8 h-8 text-error" />
              </div>
              <h1 className="text-xl font-bold">Nimadir noto'g'ri ketdi</h1>
              <p className="text-sm opacity-60">
                Kutilmagan xatolik yuz berdi. Sahifani qayta yuklang.
              </p>
              <div className="text-xs opacity-40 bg-base-200 rounded-lg p-2 mt-1 max-w-full break-all">
                {this.state.message}
              </div>
              <div className="flex gap-2 mt-3">
                <button onClick={this.handleReload} className="btn btn-primary btn-sm gap-1">
                  <RotateCcw className="w-4 h-4" /> Qayta yuklash
                </button>
                <button onClick={this.handleClearData} className="btn btn-ghost btn-sm gap-1">
                  <Trash2 className="w-4 h-4" /> Ma'lumotlarni tozalash
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
