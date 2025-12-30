import React, { useState } from 'react';
import { ArrowRight, Copy, Check, Loader2, RefreshCw } from 'lucide-react';
import translateX from '../assets/translateX.png';

export default function HinglishTranslator() {
    const [leftText, setLeftText] = useState('');
    const [rightText, setRightText] = useState('');
    const [isTranslating, setIsTranslating] = useState(false);
    const [copied, setCopied] = useState(false);
    const [isReversed, setIsReversed] = useState(false);

    const translateText = async () => {
        if (!leftText.trim()) return;

        setIsTranslating(true);
        setRightText('');

        const prompt = isReversed
            ? `Translate the following English text to natural Hinglish (Hindi written in English script). Only provide the Hinglish translation, nothing else:\n\n"${leftText}"`
            : `Translate the following Hinglish or Hindi text to simple, natural English. Only provide the English translation, nothing else:\n\n"${leftText}"`;

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'claude-sonnet-4-20250514',
                    max_tokens: 1000,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ]
                })
            });

            const data = await response.json();
            const translation = data.content
                .filter(item => item.type === 'text')
                .map(item => item.text)
                .join('');

            setRightText(translation);
        } catch (error) {
            setRightText('Translation failed. Please try again.');
            console.error('Translation error:', error);
        } finally {
            setIsTranslating(false);
        }
    };

    const handleReverse = () => {
        setIsReversed(!isReversed);
        setLeftText(rightText);
        setRightText(leftText);
    };

    const handleCopy = async () => {
        if (rightText) {
            await navigator.clipboard.writeText(rightText);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && e.ctrlKey) {
            translateText();
        }
    };

    const leftLang = isReversed ? 'English' : 'Hinglish';
    const rightLang = isReversed ? 'Hinglish' : 'English';
    const leftPlaceholder = isReversed
        ? 'Type your English text here...\n\nExample: I want to eat food'
        : 'Yahan apna text type karo...\n\nExample: mujhe khana khana hai';

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-8">
            <div className="max-w-5xl mx-auto">
                <img src={translateX} alt="logo" className='h-16 w-48 mx-auto mb-4'/>
                <div className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-bold text-gray-800 mb-3 flex items-center justify-center gap-2">
                        {leftLang}
                        <button
                            onClick={handleReverse}
                            className="  text-indigo-600 font-semibold transition-colors flex items-center justify-center gap-5"
                        >
                            <RefreshCw className="w-8 h-8" />
                        </button>
                        {rightLang}
                    </h1>
                </div>

                <div className="grid md:grid-cols-2 gap-6 relative">
                    {/* Input Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">
                                {leftLang}
                            </h2>
                            <span className="text-sm text-gray-500">
                                {leftText.length} characters
                            </span>
                        </div>
                        <textarea
                            value={leftText}
                            onChange={(e) => setLeftText(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={leftPlaceholder}
                            className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl focus:border-indigo-500 focus:outline-none resize-none text-gray-700 text-lg"
                        />
                    </div>

                    {/* Reverse Button - Centered between columns */}
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden md:block">
                        <button
                            onClick={handleReverse}
                            className="bg-white hover:bg-indigo-50 text-indigo-600 p-4 rounded-full shadow-lg border-2 border-indigo-200 transition-all hover:scale-110"
                            title="Reverse translation direction"
                        >
                            <RefreshCw className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Output Section */}
                    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-xl font-semibold text-gray-700">
                                {rightLang}
                            </h2>
                            {rightText && (
                                <button
                                    onClick={handleCopy}
                                    className="text-indigo-600 hover:text-indigo-700 transition-colors flex items-center gap-1"
                                >
                                    {copied ? (
                                        <>
                                            <Check className="w-4 h-4" />
                                            <span className="text-sm">Copied!</span>
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4" />
                                            <span className="text-sm">Copy</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                        <div className="w-full h-40 p-4 border-2 border-gray-200 rounded-xl bg-gray-50 overflow-y-auto text-gray-700 text-lg">
                            {rightText ? (
                                <p className="whitespace-pre-wrap">{rightText}</p>
                            ) : (
                                <p className="text-gray-400">
                                    Translation will appear here...
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="mt-6 flex flex-col sm:flex-row gap-4">
                    <button
                        onClick={translateText}
                        disabled={!leftText.trim() || isTranslating}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                        {isTranslating ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Translating...
                            </>
                        ) : (
                            <>
                                Translate
                                <ArrowRight className="w-5 h-5" />
                            </>
                        )}
                    </button>
                </div>

                <p className="text-xs text-gray-500 mt-2 text-center">
                    Ctrl + Enter to translate
                </p>
            </div>
        </div>
    );
}