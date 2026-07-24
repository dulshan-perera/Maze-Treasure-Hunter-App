import React from 'react';
import { PowerUp, PowerUpType, ThemeConfig } from '../types';
import { Hammer, Compass, Zap, Shield, Coins, ShoppingBag, X } from 'lucide-react';
import { playCoinSound } from '../utils/sound';

interface ShopModalProps {
  coins: number;
  inventory: Record<PowerUpType, number>;
  theme: ThemeConfig;
  onBuy: (type: PowerUpType, cost: number) => void;
  onClose: () => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  coins,
  inventory,
  theme,
  onBuy,
  onClose,
}) => {
  const shopItems: { id: PowerUpType; name: string; description: string; cost: number; icon: React.ReactNode; color: string }[] = [
    {
      id: 'drill',
      name: 'Wall Drill',
      description: 'Breaks one adjacent wall block. Perfect for escaping dead ends!',
      cost: 15,
      icon: <Hammer className="text-amber-400" size={24} id="icon-shop-drill" />,
      color: 'border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10',
    },
    {
      id: 'radar',
      name: 'Path Radar',
      description: 'Finds and briefly highlights the absolute shortest path to the treasure chest.',
      cost: 10,
      icon: <Compass className="text-cyan-400" size={24} id="icon-shop-radar" />,
      color: 'border-cyan-500/20 bg-cyan-500/5 hover:bg-cyan-500/10',
    },
    {
      id: 'speed',
      name: 'Time Dash',
      description: 'Instantly grants +20 seconds to your timer and increases run speed!',
      cost: 12,
      icon: <Zap className="text-yellow-400" size={24} id="icon-shop-speed" />,
      color: 'border-yellow-500/20 bg-yellow-500/5 hover:bg-yellow-500/10',
    },
    {
      id: 'freeze',
      name: 'Shield Barrier',
      description: 'Grants immunity to spikes, freezes enemies for 5 seconds, and restores 1 life!',
      cost: 20,
      icon: <Shield className="text-emerald-400" size={24} id="icon-shop-freeze" />,
      color: 'border-emerald-500/20 bg-emerald-500/5 hover:bg-emerald-500/10',
    },
  ];

  const handlePurchase = (item: typeof shopItems[0]) => {
    if (coins >= item.cost) {
      onBuy(item.id, item.cost);
      playCoinSound();
    }
  };

  return (
    <div id="shop-modal-overlay" className="absolute inset-0 bg-black/80 flex items-center justify-center z-40 p-4">
      <div id="shop-modal-card" className={`w-full max-w-sm rounded-2xl border p-5 flex flex-col gap-4 shadow-2xl relative ${theme.cardClass}`}>
        
        {/* Close Button */}
        <button
          id="btn-close-shop"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-white/5 text-white/60 hover:bg-white/10 hover:text-white transition-all active:scale-95"
        >
          <X size={18} id="icon-close-x" />
        </button>

        {/* Header */}
        <div id="shop-header" className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-500/15 text-amber-400" id="shop-bag-wrapper">
            <ShoppingBag size={22} id="icon-shop-bag" />
          </div>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold text-white leading-tight">Power-up Shop</h2>
            <p className="text-xs text-white/40 font-mono">Enhance your exploration</p>
          </div>
        </div>

        {/* Current Balance */}
        <div id="shop-balance" className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10">
          <span className="text-sm text-white/60 font-mono">Available Balance:</span>
          <div className="flex items-center gap-1.5 font-bold font-mono text-amber-400 text-lg" id="shop-balance-value">
            <Coins size={18} id="icon-shop-coins" />
            <span>{coins}</span>
          </div>
        </div>

        {/* Items List */}
        <div id="shop-items-list" className="flex flex-col gap-2.5 max-h-[280px] overflow-y-auto pr-1">
          {shopItems.map((item) => {
            const currentOwned = inventory[item.id] || 0;
            const canAfford = coins >= item.cost;

            return (
              <div
                key={item.id}
                id={`shop-item-row-${item.id}`}
                className={`flex flex-col gap-2 p-3 rounded-xl border transition-all ${item.color}`}
              >
                <div className="flex items-center justify-between" id={`item-top-${item.id}`}>
                  <div className="flex items-center gap-2.5" id={`item-meta-${item.id}`}>
                    <div className="p-2 rounded-lg bg-black/30" id={`item-icon-wrap-${item.id}`}>
                      {item.icon}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-semibold text-white leading-tight">{item.name}</span>
                      <span className="text-[10px] font-mono text-white/50">Owned: {currentOwned}</span>
                    </div>
                  </div>

                  <button
                    id={`btn-buy-${item.id}`}
                    onClick={() => handlePurchase(item)}
                    disabled={!canAfford}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold font-mono flex items-center gap-1 transition-all active:scale-95 cursor-pointer ${
                      canAfford
                        ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-lg shadow-amber-500/10'
                        : 'bg-white/5 text-white/30 border border-white/5 cursor-not-allowed'
                    }`}
                  >
                    <Coins size={12} id={`buy-coin-icon-${item.id}`} />
                    <span>{item.cost}</span>
                  </button>
                </div>
                <p className="text-[11px] text-white/60 leading-relaxed pl-1" id={`item-desc-${item.id}`}>
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Bottom actions */}
        <button
          id="btn-shop-back-game"
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm transition-all active:scale-[0.98] mt-2 border border-white/10"
        >
          Resume Adventure
        </button>
      </div>
    </div>
  );
};
