import QRCodeGenerator from '@/components/QRCodeGenerator';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-8 bg-gray-50">
      <div className="z-10 max-w-5xl w-full font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          ファクトリオ QRコードメーカー
        </h1>
        
        <div className="p-6 bg-white rounded-lg shadow-lg">
          <QRCodeGenerator />
        </div>
        
        <footer className="mt-12 text-center text-gray-600">
          <p>
            ファクトリオQRコードメーカー | &copy; {new Date().getFullYear()}
          </p>
          <p className="mt-2 text-xs">
            ※このツールはFactorioのファンプロジェクトです。Wube Software Ltd.とは関係ありません。
          </p>
        </footer>
      </div>
    </main>
  );
}
