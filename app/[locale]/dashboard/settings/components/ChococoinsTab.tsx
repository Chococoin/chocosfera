'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Card, CardHeader, Modal, Alert } from '@/components/ui';

interface ChocoCoinPackage {
  id: string;
  name: string;
  price: string;
  coins: number;
  description: string;
  discount?: boolean;
  popular?: boolean;
}

interface Transaction {
  id: number;
  type: string;
  date: string;
  amount: string;
}

export function ChococoinsTab() {
  const t = useTranslations('dashboard.settings');
  const [showCoinPackages, setShowCoinPackages] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  const chococoinPackages: ChocoCoinPackage[] = [
    {
      id: 'starter',
      name: '100 ChocoCoins',
      price: '€5.00',
      coins: 100,
      description: t('chococoins.packages.starterDescription'),
    },
    {
      id: 'popular',
      name: '500 ChocoCoins',
      price: '€20.00',
      coins: 500,
      description: t('chococoins.packages.popularDescription'),
      discount: true,
      popular: true,
    },
    {
      id: 'premium',
      name: '1200 ChocoCoins',
      price: '€40.00',
      coins: 1200,
      description: t('chococoins.packages.premiumDescription'),
      discount: true,
    },
    {
      id: 'mega',
      name: '3000 ChocoCoins',
      price: '€90.00',
      coins: 3000,
      description: t('chococoins.packages.megaDescription'),
      discount: true,
    },
  ];

  const transactions: Transaction[] = [
    {
      id: 1,
      type: t('chococoins.transactions.earnedSubscription'),
      date: '2024-10-01',
      amount: '+50',
    },
    {
      id: 2,
      type: t('chococoins.transactions.redeemedChocolate'),
      date: '2024-09-28',
      amount: '-30',
    },
    {
      id: 3,
      type: t('chococoins.transactions.earnedTree'),
      date: '2024-09-15',
      amount: '+100',
    },
  ];

  const handleBuyCoins = async (packageId: string) => {
    try {
      setIsProcessingPayment(true);
      const response = await fetch('/api/chococoins/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packageId }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || t('chococoins.errors.paymentInitError'));
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error buying coins:', error);
      alert(t('chococoins.errors.paymentProcessError'));
    } finally {
      setIsProcessingPayment(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-xl text-white p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-white/90 mb-2">{t('chococoins.balance')}</p>
            <p className="text-5xl font-bold">120 🪙</p>
          </div>
          <button
            type="button"
            onClick={() => setShowCoinPackages(true)}
            className="px-6 py-3 bg-white text-orange-600 font-medium rounded-lg hover:bg-orange-50 transition-all shadow-md hover:shadow-lg"
          >
            {t('chococoins.buyMore')}
          </button>
        </div>
      </div>

      {/* ChocoCoin Packages Modal */}
      <Modal
        isOpen={showCoinPackages}
        onClose={() => !isProcessingPayment && setShowCoinPackages(false)}
        title={t('chococoins.buyCoinsTitle')}
        subtitle={t('chococoins.buyCoinsSubtitle')}
        headerGradient="from-amber-500 to-orange-600"
        disabled={isProcessingPayment}
        maxWidth="4xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {chococoinPackages.map((pkg) => (
            <ChocoCoinPackageCard
              key={pkg.id}
              package={pkg}
              onBuy={handleBuyCoins}
              isProcessing={isProcessingPayment}
            />
          ))}
        </div>

        <Alert variant="info" title={t('chococoins.securePayment')} icon="🔒">
          <ul className="text-xs space-y-1 mt-2">
            <li>• {t('chococoins.paymentInfo1')}</li>
            <li>• {t('chococoins.paymentInfo2')}</li>
            <li>• {t('chococoins.paymentInfo3')}</li>
            <li>• {t('chococoins.paymentInfo4')}</li>
          </ul>
        </Alert>
      </Modal>

      {/* Transaction History */}
      <Card>
        <CardHeader title={t('chococoins.history')} />

        {transactions.length > 0 ? (
          <div className="space-y-3">
            {transactions.map((transaction) => (
              <TransactionItem key={transaction.id} transaction={transaction} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <span className="text-6xl block mb-4">🪙</span>
            <p className="text-gray-600 dark:text-gray-400">
              {t('chococoins.noTransactions')}
            </p>
          </div>
        )}
      </Card>
    </div>
  );
}

interface ChocoCoinPackageCardProps {
  package: ChocoCoinPackage;
  onBuy: (packageId: string) => void;
  isProcessing: boolean;
}

function ChocoCoinPackageCard({ package: pkg, onBuy, isProcessing }: ChocoCoinPackageCardProps) {
  const t = useTranslations('dashboard.settings');

  return (
    <div
      className={`relative border-2 rounded-xl p-6 hover:shadow-lg transition-all ${
        pkg.popular
          ? 'border-orange-500 bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'
      }`}
    >
      {pkg.popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-orange-500 text-white text-xs font-bold px-3 py-1 rounded-full">
          {t('chococoins.mostPopular')}
        </div>
      )}

      <div className="text-center mb-4">
        <span className="text-5xl block mb-2">🪙</span>
        <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
          {pkg.coins}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
          {pkg.description}
        </p>
        <p className="text-3xl font-bold text-orange-600 dark:text-orange-400">
          {pkg.price}
        </p>
      </div>

      <button
        onClick={() => onBuy(pkg.id)}
        disabled={isProcessing}
        className={`w-full py-3 rounded-lg font-bold transition-all ${
          pkg.popular
            ? 'bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700'
        } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        {isProcessing ? t('chococoins.processing') : t('chococoins.buyNow')}
      </button>
    </div>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-0">
      <div>
        <p className="font-medium text-gray-900 dark:text-white">
          {transaction.type}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {transaction.date}
        </p>
      </div>
      <span
        className={`text-lg font-bold ${
          transaction.amount.startsWith('+')
            ? 'text-green-600 dark:text-green-400'
            : 'text-red-600 dark:text-red-400'
        }`}
      >
        {transaction.amount} 🪙
      </span>
    </div>
  );
}
