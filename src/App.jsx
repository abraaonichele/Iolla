import React, { useEffect, useRef, useState } from "react";
import iro from "@jaames/iro";
import { initializeApp } from "firebase/app";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  query,
  updateDoc
} from "firebase/firestore";
import {
  AlertTriangle,
  ArrowUpDown,
  CheckSquare,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit,
  Filter,
  Gift,
  MessageCircle,
  MessageSquare,
  Plus,
  Package,
  RefreshCw,
  RotateCcw,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
  User,
  X,
  XCircle
} from "lucide-react";

const firebaseConfig = {
  apiKey: "AIzaSyAfWDUpxMVWNX39_RSmJf6ApXSk6MMxZvU",
  authDomain: "iolla-biquinis.firebaseapp.com",
  projectId: "iolla-biquinis",
  storageBucket: "iolla-biquinis.firebasestorage.app",
  messagingSenderId: "566956113450",
  appId: "1:566956113450:web:3f17d08ee0f7f485a9cd53"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const formatDate = (dateString) => {
  if (!dateString) return "-";
  const parts = dateString.split("-");
  if (parts.length !== 3) return dateString;
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
};

const getTodayDate = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatReleaseDateTime = (dateString) => {
  if (!dateString) {
    return null;
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("pt-BR", {
    dateStyle: "short",
    timeStyle: "short"
  }).format(date);
};

const getDesktopUpdatesApi = () => {
  if (typeof window === "undefined") {
    return null;
  }

  return window.iollaDesktop?.updates || null;
};

const getInitialUpdateStatus = () => ({
  state: getDesktopUpdatesApi() ? "idle" : "unsupported",
  message: getDesktopUpdatesApi()
    ? "Preparando atualizações automáticas..."
    : "Atualizações indisponíveis neste ambiente.",
  progress: null,
  version: null,
  availableVersion: null,
  releaseDate: null,
  releaseNotes: null
});

const normalizeHexColor = (rawValue, fallback = "#e6d0d4") => {
  if (typeof rawValue !== "string") return fallback;
  const value = rawValue.trim();
  if (/^#[0-9a-f]{6}$/i.test(value)) return value;
  if (/^#[0-9a-f]{3}$/i.test(value)) {
    return `#${value[1]}${value[1]}${value[2]}${value[2]}${value[3]}${value[3]}`.toLowerCase();
  }
  return fallback;
};

const IroColorWheel = ({ value, onChange }) => {
  const containerRef = useRef(null);
  const pickerRef = useRef(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || pickerRef.current) return;

    const initialColor = normalizeHexColor(value);
    const picker = iro.ColorPicker(containerRef.current, {
      width: 260,
      color: initialColor,
      layoutDirection: "vertical",
      layout: [
        {
          component: iro.ui.Wheel,
          options: { wheelLightness: false }
        },
        {
          component: iro.ui.Slider,
          options: { sliderType: "value" }
        }
      ]
    });

    const handleChange = (color) => {
      if (!onChangeRef.current) return;
      onChangeRef.current(color.hexString);
    };

    picker.on("color:change", handleChange);
    pickerRef.current = picker;

    return () => {
      picker.off("color:change", handleChange);
      pickerRef.current = null;
      if (containerRef.current) {
        containerRef.current.innerHTML = "";
      }
    };
  }, []);

  useEffect(() => {
    if (!pickerRef.current) return;
    const normalized = normalizeHexColor(value);
    if (pickerRef.current.color.hexString.toLowerCase() !== normalized.toLowerCase()) {
      pickerRef.current.color.hexString = normalized;
    }
  }, [value]);

  return <div className="mx-auto w-fit" ref={containerRef} />;
};

const ColorPicker = ({ value, onChange, buttonLabel = "Escolher cor" }) => {
  const [showPicker, setShowPicker] = useState(false);
  const [hexInput, setHexInput] = useState(normalizeHexColor(value));
  const originalColorRef = useRef(normalizeHexColor(value));

  useEffect(() => {
    if (!showPicker) return;
    originalColorRef.current = normalizeHexColor(value);
    setHexInput(normalizeHexColor(value));
  }, [showPicker, value]);

  useEffect(() => {
    if (!showPicker) return;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onChange(originalColorRef.current);
        setShowPicker(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onChange, showPicker]);

  const previewColor = normalizeHexColor(value);

  return (
    <div className="relative">
      <button
        onClick={() => setShowPicker(!showPicker)}
        className="flex items-center gap-2 rounded-lg border border-[#e6d0d4] bg-white px-3 py-2 text-sm font-medium text-[#5c3a3a] transition-all hover:bg-[#fae8eb]"
      >
        <div
          className="h-6 w-6 rounded border border-[#d0d0d0]"
          style={{ backgroundColor: previewColor }}
        />
        {buttonLabel}
      </button>

      {showPicker && (
        <div
          className="fixed inset-0 z-[10010] bg-slate-900/30 backdrop-blur-sm animate-in fade-in duration-150"
          onClick={() => {
            onChange(originalColorRef.current);
            setShowPicker(false);
          }}
        />
      )}
      {showPicker && (
        <div
          className="fixed inset-0 z-[10020] flex items-center justify-center p-4 animate-in fade-in duration-150"
          onClick={() => {
            onChange(originalColorRef.current);
            setShowPicker(false);
          }}
        >
          <div
            className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-150"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
              <div>
                <h3 className="text-base font-bold text-[#5c3a3a]">Selecionar cor</h3>
                <p className="mt-0.5 text-xs text-[#8a6a6a]">
                  Arraste no c\u00edrculo para escolher e ajuste a luminosidade no slider.
                </p>
              </div>
              <button
                onClick={() => {
                  onChange(originalColorRef.current);
                  setShowPicker(false);
                }}
                className="rounded-lg p-2 text-[#8a6a6a] transition-colors hover:bg-[#fae8eb] hover:text-[#5c3a3a]"
                title="Fechar"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4 px-6 py-5">
              <IroColorWheel
                value={previewColor}
                onChange={(nextColor) => {
                  const normalized = normalizeHexColor(nextColor);
                  setHexInput(normalized);
                  onChange(normalized);
                }}
              />

              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-lg border border-[#e6d0d4]"
                  style={{ backgroundColor: previewColor }}
                />
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-[#8a6a6a]">
                    Hex
                  </label>
                  <input
                    value={hexInput}
                    onChange={(event) => {
                      const nextValue = event.target.value;
                      setHexInput(nextValue);
                      const normalized = normalizeHexColor(nextValue, null);
                      if (normalized) {
                        onChange(normalized);
                      }
                    }}
                    placeholder="#rrggbb"
                    className="w-full rounded-lg border border-[#e6d0d4] px-3 py-2 text-sm text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
                    inputMode="text"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
              <button
                onClick={() => {
                  onChange(originalColorRef.current);
                  setShowPicker(false);
                }}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                onClick={() => setShowPicker(false)}
                className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c]"
              >
                Aplicar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const getUpdateBadgeClassName = (state) => {
  if (state === "downloaded") {
    return "border-green-200 bg-green-50 text-green-700";
  }

  if (state === "downloading" || state === "checking" || state === "available") {
    return "border-yellow-200 bg-yellow-50 text-yellow-700";
  }

  if (state === "error") {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-[#e6d0d4] bg-[#fff7f8] text-[#8a6a6a]";
};

const getUpdateButtonLabel = (updateStatus) => {
  if (updateStatus.state === "downloaded") {
    return "Instalar atualização";
  }

  if (updateStatus.state === "downloading" && typeof updateStatus.progress === "number") {
    return `Baixando ${updateStatus.progress}%`;
  }

  if (updateStatus.state === "checking") {
    return "Verificando...";
  }

  return "Verificar atualização";
};

const Card = ({ children, className = "" }) => (
  <div className={`rounded-xl border border-[#f3e6e8] bg-white shadow-sm ${className}`}>
    {children}
  </div>
);

const Flower = ({ className, color = "#e6d0d4", size = 100, rotation = 0 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    className={`absolute ${className}`}
    style={{ transform: `rotate(${rotation}deg)` }}
    fill={color}
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M50 50 C50 20 20 20 20 50 C20 80 50 80 50 50 Z" opacity="0.6" />
    <path d="M50 50 C80 50 80 20 50 20 C20 20 20 50 50 50 Z" opacity="0.6" />
    <path d="M50 50 C50 80 80 80 80 50 C80 20 50 20 50 50 Z" opacity="0.6" />
    <path d="M50 50 C20 50 20 80 50 80 C80 80 80 50 50 50 Z" opacity="0.6" />
    <circle cx="50" cy="50" r="10" fill="#fff" opacity="0.8" />
  </svg>
);

const ConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  isDanger = false,
  showCancel = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[11000] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-4">
            <div
              className={`flex-shrink-0 rounded-full p-3 ${
                isDanger ? "bg-red-50 text-red-600" : "bg-yellow-50 text-yellow-600"
              }`}
            >
              <AlertTriangle size={24} />
            </div>
            <h3 className="font-serif text-xl font-bold text-[#5c3a3a]">{title}</h3>
          </div>
          <p className="ml-16 -mt-2 mb-8 whitespace-pre-wrap leading-relaxed text-gray-600">
            {message}
          </p>
          <div className="flex justify-end gap-3">
            {showCancel && (
              <button
                onClick={onClose}
                className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={onConfirm}
              className={`rounded-lg px-4 py-2 font-medium text-white transition-colors shadow-sm ${
                isDanger
                  ? "bg-red-600 shadow-red-100 hover:bg-red-700"
                  : "bg-[#5c3a3a] shadow-[#e6d0d4] hover:bg-[#4a2c2c]"
              }`}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ObservationModal = ({ isOpen, onClose, text }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="p-6">
          <div className="mb-4 flex items-center gap-3 border-b border-gray-100 pb-3">
            <MessageSquare size={20} className="text-[#5c3a3a]" />
            <h3 className="text-lg font-bold text-[#5c3a3a]">Observação Completa</h3>
          </div>
          <div className="max-h-96 overflow-y-auto rounded-lg border border-gray-100 bg-gray-50 p-4">
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">{text}</p>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c]"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const ReleaseNotesModal = ({ isOpen, onClose, version, releaseDate, releaseNotes }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-2xl overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-[#fae8eb] p-3 text-[#5c3a3a]">
              <MessageSquare size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-[#5c3a3a]">
                Novidades da versão {version || "mais recente"}
              </h3>
              {releaseDate && (
                <p className="mt-1 text-sm text-[#8a6a6a]">
                  Publicada em {formatReleaseDateTime(releaseDate)}
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="max-h-[60vh] overflow-y-auto bg-[#fffafb] px-6 py-5">
          <div className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {releaseNotes || "Nenhuma nota de versão foi enviada para esta atualização."}
          </div>
        </div>
        <div className="flex justify-end border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c]"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};

const StockTabModal = ({ isOpen, onClose, onSave, onDelete, isEditing, formData, setFormData }) => {
  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#5c3a3a]">
            {isEditing ? "Editar Aba" : "Nova Aba de Estoque"}
          </h3>
          <p className="mt-1 text-sm text-[#8a6a6a]">
            {isEditing
              ? "Altere o nome e a cor da aba."
              : "Crie uma nova aba para agrupar seus produtos."}
          </p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Nome da Aba</label>
            <input
              type="text"
              value={formData.name}
              onChange={(event) => updateField("name", event.target.value)}
              placeholder="Ex: Verão 2024"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              maxLength="50"
            />
            <p className="mt-1 text-xs text-[#a88a8a]">{formData.name.length}/50</p>
          </div>
          <div>
            <label className="mb-3 block text-sm font-medium text-[#8a6a6a]">Cor da Aba</label>
            <ColorPicker
              value={formData.color}
              buttonLabel="Cor da Aba"
              onChange={(color) => updateField("color", color)}
            />
          </div>
        </div>
        <div className="flex justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <div>
            {isEditing && (
              <button
                onClick={onDelete}
                className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-100"
              >
                Excluir Aba
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              disabled={!formData.name.trim()}
              className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEditing ? "Atualizar" : "Criar Aba"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StockFormModal = ({ isOpen, onClose, onSave, formData, setFormData }) => {
  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#5c3a3a]">Cadastrar Estoque</h3>
          <p className="mt-1 text-sm text-[#8a6a6a]">
            Preencha os dados para cadastrar um item no estoque.
          </p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Modelo</label>
            <input
              type="text"
              value={formData.model}
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="Ex: Biquíni Cortininha"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Cor</label>
              <input
                type="text"
                value={formData.color}
                onChange={(event) => updateField("color", event.target.value)}
                placeholder="Ex: Preto"
                className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Tamanho</label>
              <input
                type="text"
                value={formData.size}
                onChange={(event) => updateField("size", event.target.value)}
                placeholder="Ex: M"
                className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Quantidade</label>
            <input
              type="number"
              min="0"
              step="1"
              value={formData.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Cor do Card</label>
            <ColorPicker
              value={formData.cardColor || "#e6d0d4"}
              buttonLabel="Cor do Card"
              onChange={(color) => updateField("cardColor", color)}
            />
          </div>
        </div>
        <div className="flex justify-end gap-3 border-t border-gray-100 px-6 py-4">
          <button
            onClick={onClose}
            className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onSave}
            className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c]"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
};

const StockEditModal = ({ isOpen, onClose, onSave, onDelete, editData, setEditData }) => {
  if (!isOpen) return null;

  const updateField = (field, value) => {
    setEditData((current) => ({ ...current, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/20 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-lg overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl animate-in zoom-in-95 duration-200">
        <div className="border-b border-gray-100 px-6 py-5">
          <h3 className="text-lg font-bold text-[#5c3a3a]">Editar Estoque</h3>
          <p className="mt-1 text-sm text-[#8a6a6a]">
            Atualize as informações do produto no estoque.
          </p>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Modelo</label>
            <input
              type="text"
              value={editData.model}
              onChange={(event) => updateField("model", event.target.value)}
              placeholder="Ex: Biquíni Cortininha"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Cor</label>
              <input
                type="text"
                value={editData.color}
                onChange={(event) => updateField("color", event.target.value)}
                placeholder="Ex: Preto"
                className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Tamanho</label>
              <input
                type="text"
                value={editData.size}
                onChange={(event) => updateField("size", event.target.value)}
                placeholder="Ex: M"
                className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Quantidade</label>
            <input
              type="number"
              min="0"
              step="1"
              value={editData.quantity}
              onChange={(event) => updateField("quantity", event.target.value)}
              placeholder="0"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Cor do Card</label>
            <ColorPicker
              value={editData.cardColor || "#e6d0d4"}
              buttonLabel="Cor do Card"
              onChange={(color) => updateField("cardColor", color)}
            />
          </div>
        </div>
        <div className="flex justify-between gap-3 border-t border-gray-100 px-6 py-4">
          <div>
            <button
              onClick={onDelete}
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 font-medium text-red-600 transition-colors hover:bg-red-100"
            >
              Excluir item
            </button>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-2 font-medium text-gray-600 transition-colors hover:bg-gray-100"
            >
              Cancelar
            </button>
            <button
              onClick={onSave}
              className="rounded-lg bg-[#5c3a3a] px-4 py-2 font-medium text-white shadow-sm shadow-[#e6d0d4] transition-colors hover:bg-[#4a2c2c]"
            >
              Atualizar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const StatusSelect = ({ currentStatus, onChange, disabled = false }) => {
  const styles = {
    "Sem produção": "border-red-200 bg-red-50 text-red-700",
    "Em produção": "border-yellow-200 bg-yellow-50 text-yellow-700",
    Finalizado: "border-[#d6ede0] bg-[#e6f5ea] text-[#2d6642]"
  };

  return (
    <div className="relative inline-block w-32">
      <select
        value={currentStatus}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        className={`w-full cursor-pointer appearance-none truncate rounded-full border px-2 py-1.5 text-xs font-medium outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20 ${
          styles[currentStatus] || styles["Sem produção"]
        } ${disabled ? "cursor-not-allowed opacity-60" : ""}`}
      >
        <option value="Sem produção">Sem produção</option>
        <option value="Em produção">Em produção</option>
        <option value="Finalizado">Finalizado</option>
      </select>
      <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-current opacity-60">
        <ChevronDown size={12} />
      </div>
    </div>
  );
};

const Button = ({
  children,
  variant = "primary",
  onClick,
  className = "",
  icon: Icon,
  disabled = false
}) => {
  const baseStyle =
    "flex items-center justify-center rounded-lg px-4 py-2 font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1";
  const variants = {
    primary: "bg-[#5c3a3a] text-white hover:bg-[#4a2c2c] focus:ring-[#5c3a3a]",
    secondary:
      "border border-[#e6d0d4] bg-white text-[#5c3a3a] hover:bg-[#fae8eb] focus:ring-[#e6d0d4]",
    danger: "bg-red-50 text-red-600 hover:bg-red-100 focus:ring-red-200",
    ghost: "bg-transparent text-[#5c3a3a] hover:bg-[#fae8eb]"
  };

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyle} ${variants[variant]} ${className} ${
        disabled ? "cursor-not-allowed opacity-70" : ""
      }`}
    >
      {Icon && <Icon size={18} className="mr-2" />}
      {children}
    </button>
  );
};

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const sidebarRef = useRef(null);
  const sidebarToggleButtonRef = useRef(null);
  const [currentView, setCurrentView] = useState("list");
  const [activeMenu, setActiveMenu] = useState("inicio");
  const [editingId, setEditingId] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    type: null,
    orderId: null,
    message: "",
    title: ""
  });
  const [obsModal, setObsModal] = useState({ isOpen: false, text: "" });
  const [filters, setFilters] = useState({
    id: "",
    customer: "",
    date: "",
    status: ""
  });
  const [sortOption, setSortOption] = useState("id_desc");
  const [orders, setOrders] = useState([]);
  const [stockItems, setStockItems] = useState([]);
  const [newOrder, setNewOrder] = useState({
    id: "",
    customer: "",
    date: getTodayDate(),
    status: "Sem produção",
    shippingMethod: "Sedex",
    isGift: false,
    observation: "",
    category: "pedidos"
  });
  const [updateStatus, setUpdateStatus] = useState(getInitialUpdateStatus);
  const [isReleaseNotesOpen, setIsReleaseNotesOpen] = useState(false);
  const [stockFormModalOpen, setStockFormModalOpen] = useState(false);
  const [stockFormData, setStockFormData] = useState({
    model: "",
    color: "",
    size: "",
    quantity: "",
    cardColor: "#e6d0d4"
  });
  const [stockEditModal, setStockEditModal] = useState({
    isOpen: false,
    itemId: null
  });
  const [stockEditData, setStockEditData] = useState({
    model: "",
    color: "",
    size: "",
    quantity: "",
    cardColor: "#e6d0d4"
  });
  const [stockTabs, setStockTabs] = useState([]);
  const [activeStockTab, setActiveStockTab] = useState(null);
  const [stockTabModal, setStockTabModal] = useState({
    isOpen: false,
    isEditing: false,
    tabId: null
  });
  const [stockTabFormData, setStockTabFormData] = useState({
    name: "",
    color: "#e6d0d4"
  });

  const triggerError = (message) => {
    setModalConfig({
      isOpen: true,
      type: "error",
      message,
      title: "Atenção",
      orderId: null
    });
  };

  useEffect(() => {
    const ordersQuery = query(collection(db, "orders"));

    const unsubscribe = onSnapshot(
      ordersQuery,
      (snapshot) => {
        const loadedOrders = snapshot.docs.map((snapshotDoc) => {
          const data = snapshotDoc.data();
          return {
            ...data,
            firestoreId: snapshotDoc.id,
            shippingMethod: data.shippingMethod || "Não informado",
            isGift: data.isGift || false,
            observation: data.observation || "",
            category: data.category || "pedidos"
          };
        });

        setOrders(loadedOrders);
      },
      (error) => {
        console.error("Erro no listener de pedidos:", error);
        triggerError(
          "Erro ao carregar dados do Firebase. Verifique as permissões e a conexão com a internet."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const stockTabsQuery = query(collection(db, "stockTabs"));

    const unsubscribe = onSnapshot(
      stockTabsQuery,
      (snapshot) => {
        const loadedTabs = snapshot.docs
          .map((snapshotDoc) => {
            const data = snapshotDoc.data();
            return {
              firestoreId: snapshotDoc.id,
              name: data.name || "Sem nome",
              color: data.color || "#e6d0d4",
              createdAt: data.createdAt || new Date().toISOString()
            };
          })
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

        setStockTabs(loadedTabs);
        if (loadedTabs.length > 0 && !activeStockTab) {
          setActiveStockTab(loadedTabs[0].firestoreId);
        } else if (loadedTabs.length === 0) {
          setActiveStockTab(null);
        }
      },
      (error) => {
        console.error("Erro no listener de abas de estoque:", error);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const stockQuery = query(collection(db, "stock"));

    const unsubscribe = onSnapshot(
      stockQuery,
      (snapshot) => {
        const loadedStock = snapshot.docs
          .map((snapshotDoc) => {
            const data = snapshotDoc.data();
            const parsedQuantity = Number(data.quantity);

            return {
              firestoreId: snapshotDoc.id,
              model: (data.model || "").toString(),
              color: (data.color || "").toString(),
              size: (data.size || "").toString(),
              quantity: Number.isFinite(parsedQuantity) ? parsedQuantity : 0,
              cardColor: data.cardColor || "#e6d0d4",
              tabId: data.tabId || null
            };
          })
          .sort((a, b) => {
            const left = `${a.model} ${a.color} ${a.size}`.toLowerCase();
            const right = `${b.model} ${b.color} ${b.size}`.toLowerCase();
            return left.localeCompare(right, "pt-BR");
          });

        setStockItems(loadedStock);
      },
      (error) => {
        console.error("Erro no listener de estoque:", error);
        triggerError(
          "Erro ao carregar o estoque no Firebase. Verifique as permissões e a conexão."
        );
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    setSelectedIds([]);
    setFilters({ id: "", customer: "", date: "", status: "" });
  }, [activeMenu, currentView]);

  useEffect(() => {
    const updatesApi = getDesktopUpdatesApi();
    if (!updatesApi) {
      return undefined;
    }

    let unsubscribe = () => {};

    updatesApi
      .getStatus()
      .then((status) => {
        setUpdateStatus(status);
      })
      .catch((error) => {
        console.error("Erro ao obter status do updater:", error);
      });

    unsubscribe = updatesApi.onStatusChange((status) => {
      setUpdateStatus(status);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleAutoCollapseSidebar = (event) => {
      if (!isSidebarOpen || !(event.target instanceof Element)) {
        return;
      }

      if (sidebarToggleButtonRef.current?.contains(event.target)) {
        return;
      }

      const clickedButton = Boolean(event.target.closest("button"));
      const clickedInsideSidebar = sidebarRef.current?.contains(event.target);

      if (clickedButton || !clickedInsideSidebar) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("click", handleAutoCollapseSidebar);

    return () => {
      document.removeEventListener("click", handleAutoCollapseSidebar);
    };
  }, [isSidebarOpen]);

  const pedidosCount = orders.filter(
    (order) => !order.deleted && (order.category || "pedidos") === "pedidos"
  ).length;
  const whatsappCount = orders.filter(
    (order) => !order.deleted && order.category === "whatsapp"
  ).length;
  const trocaCount = orders.filter(
    (order) => !order.deleted && order.category === "troca"
  ).length;
  const stockCount = stockItems.length;
  const deletedOrdersCount = orders.filter((order) => order.deleted).length;
  const updateButtonDisabled =
    updateStatus.state === "development" ||
    updateStatus.state === "unsupported" ||
    updateStatus.state === "checking" ||
    updateStatus.state === "downloading";
  const canInstallUpdate = updateStatus.state === "downloaded";
  const hasReleaseNotes = Boolean(updateStatus.releaseNotes);

  const handleUpdateButtonClick = async () => {
    const updatesApi = getDesktopUpdatesApi();
    if (!updatesApi) {
      return;
    }

    try {
      if (canInstallUpdate) {
        await updatesApi.quitAndInstall();
        return;
      }

      const nextStatus = await updatesApi.check();
      if (nextStatus) {
        setUpdateStatus(nextStatus);
      }
    } catch (error) {
      console.error("Erro ao acionar updater:", error);
      setUpdateStatus((current) => ({
        ...current,
        state: "error",
        message: "Não foi possível executar a atualização agora."
      }));
    }
  };

  const handleFilterChange = (field, value) => {
    setFilters((previous) => ({ ...previous, [field]: value }));
  };

  const clearFilters = () => {
    setFilters({ id: "", customer: "", date: "", status: "" });
  };

  const filteredOrders = orders
    .filter((order) =>
      activeMenu === "lixeira"
        ? order.deleted
        : !order.deleted && (order.category || "pedidos") === activeMenu
    )
    .filter((order) => {
      const matchId = filters.id ? (order.id || "").toString().includes(filters.id) : true;
      const matchCustomer = filters.customer
        ? (order.customer || "").toLowerCase().includes(filters.customer.toLowerCase())
        : true;
      const matchDate = filters.date ? order.date === filters.date : true;
      const matchStatus = filters.status ? order.status === filters.status : true;

      return matchId && matchCustomer && matchDate && matchStatus;
    })
    .sort((a, b) => {
      if (sortOption === "date_asc") return (a.date || "").localeCompare(b.date || "");
      if (sortOption === "id_asc") return Number(a.id || 0) - Number(b.id || 0);
      return Number(b.id || 0) - Number(a.id || 0);
    });

  const handleSelectAll = (event) => {
    if (event.target.checked) {
      setSelectedIds(filteredOrders.map((order) => order.firestoreId));
      return;
    }

    setSelectedIds([]);
  };

  const handleSelectOrder = (firestoreId) => {
    if (selectedIds.includes(firestoreId)) {
      setSelectedIds(selectedIds.filter((currentId) => currentId !== firestoreId));
      return;
    }

    setSelectedIds([...selectedIds, firestoreId]);
  };

  const handleQuickStatusChange = async (firestoreId, newStatus) => {
    try {
      const orderToUpdate = orders.find((order) => order.firestoreId === firestoreId);
      if (!orderToUpdate) return;

      await updateDoc(doc(db, "orders", orderToUpdate.firestoreId), { status: newStatus });
    } catch (error) {
      console.error("Erro ao alterar status:", error);
      triggerError("Não foi possível atualizar o status do registro.");
    }
  };

  const handleBulkStatusChange = async (newStatus) => {
    if (!newStatus) return;

    try {
      const updates = orders
        .filter((order) => selectedIds.includes(order.firestoreId))
        .map((order) => updateDoc(doc(db, "orders", order.firestoreId), { status: newStatus }));

      await Promise.all(updates);
      setSelectedIds([]);
    } catch (error) {
      console.error("Erro ao alterar status em lote:", error);
      triggerError("Não foi possível atualizar o status dos itens selecionados.");
    }
  };

  const handleBulkRestore = async () => {
    try {
      const updates = orders
        .filter((order) => selectedIds.includes(order.firestoreId))
        .map((order) => updateDoc(doc(db, "orders", order.firestoreId), { deleted: false }));

      await Promise.all(updates);
      setSelectedIds([]);
    } catch (error) {
      console.error("Erro ao restaurar itens:", error);
      triggerError("Não foi possível restaurar os itens selecionados.");
    }
  };

  const requestMoveToTrash = (firestoreId) =>
    setModalConfig({ isOpen: true, type: "trash", orderId: firestoreId });
  const requestPermanentDelete = (firestoreId) =>
    setModalConfig({ isOpen: true, type: "delete", orderId: firestoreId });
  const requestStockDelete = (firestoreId) =>
    setModalConfig({ isOpen: true, type: "delete-stock", orderId: firestoreId });
  const requestBulkMoveToTrash = () =>
    setModalConfig({ isOpen: true, type: "bulk-trash", orderId: null });
  const requestBulkPermanentDelete = () =>
    setModalConfig({ isOpen: true, type: "bulk-delete", orderId: null });

  const executeModalAction = async () => {
    const { type, orderId } = modalConfig;

    if (type === "duplicate" || type === "error") {
      setModalConfig({ isOpen: false, type: null, orderId: null });
      return;
    }

    try {
      if (type === "trash") {
        const order = orders.find((currentOrder) => currentOrder.firestoreId === orderId);
        if (order) {
          await updateDoc(doc(db, "orders", order.firestoreId), { deleted: true });
        }
      } else if (type === "delete") {
        const order = orders.find((currentOrder) => currentOrder.firestoreId === orderId);
        if (order) {
          await deleteDoc(doc(db, "orders", order.firestoreId));
        }
      } else if (type === "delete-stock") {
        if (orderId) {
          await deleteDoc(doc(db, "stock", orderId));
        }
        closeStockEditModal();
      } else if (type === "bulk-trash") {
        const updates = orders
          .filter((order) => selectedIds.includes(order.firestoreId))
          .map((order) => updateDoc(doc(db, "orders", order.firestoreId), { deleted: true }));

        await Promise.all(updates);
        setSelectedIds([]);
      } else if (type === "bulk-delete") {
        const deletions = orders
          .filter((order) => selectedIds.includes(order.firestoreId))
          .map((order) => deleteDoc(doc(db, "orders", order.firestoreId)));

        await Promise.all(deletions);
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Erro ao executar ação:", error);
      triggerError("Erro ao processar a solicitação no Firebase.");
    }

    setModalConfig({ isOpen: false, type: null, orderId: null });
  };

  const handleRestoreOrder = async (firestoreId) => {
    try {
      const order = orders.find((currentOrder) => currentOrder.firestoreId === firestoreId);
      if (!order) return;

      await updateDoc(doc(db, "orders", order.firestoreId), { deleted: false });
    } catch (error) {
      console.error("Erro ao restaurar item:", error);
      triggerError("Não foi possível restaurar este item.");
    }
  };

  const handleEditClick = (order) => {
    setEditingId(order.firestoreId);
    setNewOrder({
      id: order.id || "",
      customer: order.customer,
      date: order.date,
      status: order.status,
      shippingMethod: order.shippingMethod || "Sedex",
      isGift: order.isGift || false,
      observation: order.observation || "",
      category: order.category || "pedidos"
    });
    setCurrentView("create");
  };

  const handleCreateNewClick = () => {
    setEditingId(null);
    setNewOrder({
      id: "",
      customer: "",
      date: getTodayDate(),
      status: "Sem produção",
      shippingMethod: "Sedex",
      isGift: false,
      observation: "",
      category: activeMenu === "lixeira" ? "pedidos" : activeMenu
    });
    setCurrentView("create");
  };

  const handleSaveOrder = async () => {
    if (!newOrder.customer || !newOrder.customer.trim()) {
      triggerError("Por favor, informe o nome do cliente.");
      return;
    }

    if (newOrder.category === "pedidos" && !newOrder.id) {
      triggerError("Por favor, informe o ID do pedido.");
      return;
    }

    const parsedId = newOrder.id ? Number(newOrder.id) : "";
    const orderData = {
      id: parsedId,
      customer: newOrder.customer,
      date: newOrder.date,
      status: newOrder.status,
      deleted: false,
      shippingMethod: newOrder.shippingMethod,
      isGift: newOrder.isGift,
      observation: newOrder.observation,
      category: newOrder.category
    };

    const existingOrder =
      parsedId !== ""
        ? orders.find(
            (order) =>
              order.id === parsedId && (order.category || "pedidos") === newOrder.category
          )
        : null;
    const isDuplicate = Boolean(existingOrder);

    try {
      if (editingId) {
        const currentOrderToEdit = orders.find((order) => order.firestoreId === editingId);

        if (isDuplicate && existingOrder.firestoreId !== currentOrderToEdit?.firestoreId) {
          setModalConfig({ isOpen: true, type: "duplicate", orderId: null });
          return;
        }

        if (currentOrderToEdit) {
          await updateDoc(doc(db, "orders", currentOrderToEdit.firestoreId), orderData);
        }
      } else {
        if (isDuplicate) {
          setModalConfig({ isOpen: true, type: "duplicate", orderId: null });
          return;
        }

        await addDoc(collection(db, "orders"), orderData);
      }

      setCurrentView("list");
      setEditingId(null);
    } catch (error) {
      console.error("Erro ao salvar registro:", error);
      triggerError(
        `Erro ao salvar no banco de dados. Veja se as regras do Firestore estão permitindo acesso. Erro original: ${error.message}`
      );
    }
  };

  const resetStockForm = () => {
    setStockFormData({
      model: "",
      color: "",
      size: "",
      quantity: "",
      cardColor: "#e6d0d4"
    });
  };

  const openStockFormModal = () => {
    resetStockForm();
    setStockFormModalOpen(true);
  };

  const closeStockFormModal = () => {
    setStockFormModalOpen(false);
    resetStockForm();
  };

  const handleSaveStockItem = async () => {
    const model = stockFormData.model.trim();
    const color = stockFormData.color.trim();
    const size = stockFormData.size.trim();
    const parsedQuantity = Number(stockFormData.quantity);
    const cardColor = normalizeHexColor(stockFormData.cardColor);

    if (!model || !color || !size) {
      triggerError("Preencha modelo, cor e tamanho para cadastrar o estoque.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      triggerError("A quantidade do estoque precisa ser um número inteiro maior ou igual a zero.");
      return;
    }

    if (!activeStockTab) {
      triggerError("Crie uma aba de estoque primeiro.");
      return;
    }

    try {
      await addDoc(collection(db, "stock"), {
        model,
        color,
        size,
        quantity: parsedQuantity,
        cardColor,
        tabId: activeStockTab
      });
      closeStockFormModal();
    } catch (error) {
      console.error("Erro ao cadastrar item de estoque:", error);
      triggerError("Não foi possível cadastrar o item no estoque.");
    }
  };

  const openStockEditModal = (item) => {
    setStockEditData({
      model: item.model || "",
      color: item.color || "",
      size: item.size || "",
      quantity: String(item.quantity ?? 0),
      cardColor: item.cardColor || "#e6d0d4"
    });
    setStockEditModal({
      isOpen: true,
      itemId: item.firestoreId
    });
  };

  const closeStockEditModal = () => {
    setStockEditModal({ isOpen: false, itemId: null });
    setStockEditData({
      model: "",
      color: "",
      size: "",
      quantity: "",
      cardColor: "#e6d0d4"
    });
  };

  const handleUpdateStockItem = async () => {
    if (!stockEditModal.itemId) {
      closeStockEditModal();
      return;
    }

    const parsedQuantity = Number(stockEditData.quantity);
    const cardColor = normalizeHexColor(stockEditData.cardColor);

    if (!stockEditData.model.trim()) {
      triggerError("Digite um modelo válido.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity < 0) {
      triggerError("Digite uma quantidade válida (inteiro maior ou igual a zero).");
      return;
    }

    try {
      await updateDoc(doc(db, "stock", stockEditModal.itemId), {
        model: stockEditData.model.trim(),
        color: stockEditData.color.trim(),
        size: stockEditData.size.trim(),
        quantity: parsedQuantity,
        cardColor
      });
      closeStockEditModal();
    } catch (error) {
      console.error("Erro ao atualizar item do estoque:", error);
      triggerError("Não foi possível atualizar o item do estoque.");
    }
  };

  const openStockTabModal = (tab = null) => {
    if (tab) {
      setStockTabFormData({ name: tab.name, color: tab.color });
      setStockTabModal({ isOpen: true, isEditing: true, tabId: tab.firestoreId });
    } else {
      setStockTabFormData({ name: "", color: "#e6d0d4" });
      setStockTabModal({ isOpen: true, isEditing: false, tabId: null });
    }
  };

  const closeStockTabModal = () => {
    setStockTabModal({ isOpen: false, isEditing: false, tabId: null });
    setStockTabFormData({ name: "", color: "#e6d0d4" });
  };

  const handleSaveStockTab = async () => {
    if (!stockTabFormData.name.trim()) {
      triggerError("Digite um nome para a aba.");
      return;
    }

    const tabColor = normalizeHexColor(stockTabFormData.color);

    try {
      if (stockTabModal.isEditing) {
        await updateDoc(doc(db, "stockTabs", stockTabModal.tabId), {
          name: stockTabFormData.name.trim(),
          color: tabColor
        });
      } else {
        const docRef = await addDoc(collection(db, "stockTabs"), {
          name: stockTabFormData.name.trim(),
          color: tabColor,
          createdAt: new Date().toISOString()
        });
        setActiveStockTab(docRef.id);
      }
      closeStockTabModal();
    } catch (error) {
      console.error("Erro ao salvar aba:", error);
      triggerError("Não foi possível salvar a aba.");
    }
  };

  const handleDeleteStockTab = async () => {
    if (!stockTabModal.tabId) return;

    try {
      // Deletar todos os itens desta aba
      const itemsToDelete = stockItems.filter((item) => item.tabId === stockTabModal.tabId);
      for (const item of itemsToDelete) {
        await deleteDoc(doc(db, "stock", item.firestoreId));
      }
      // Deletar a aba
      await deleteDoc(doc(db, "stockTabs", stockTabModal.tabId));
      closeStockTabModal();
      if (activeStockTab === stockTabModal.tabId) {
        setActiveStockTab(stockTabs.length > 1 ? stockTabs[0].firestoreId : null);
      }
    } catch (error) {
      console.error("Erro ao deletar aba:", error);
      triggerError("Não foi possível deletar a aba.");
    }
  };

  const getMenuTitle = () => {
    if (activeMenu === "pedidos") return "Gerenciar Pedidos";
    if (activeMenu === "whatsapp") return "Gerenciar WhatsApp";
    if (activeMenu === "troca") return "Gerenciar Trocas";
    if (activeMenu === "lixeira") return "Lixeira";
    return "Gerenciar";
  };

  const getAddButtonText = () => {
    if (activeMenu === "whatsapp") return "Novo Contato";
    if (activeMenu === "troca") return "Nova Troca";
    return "Novo Pedido";
  };

  const formTitle = editingId
    ? newOrder.category === "whatsapp"
      ? "Editar Contato"
      : newOrder.category === "troca"
        ? "Editar Troca"
        : "Editar Pedido"
    : newOrder.category === "whatsapp"
      ? "Novo Contato"
      : newOrder.category === "troca"
        ? "Nova Troca"
        : "Novo Pedido";

  const getModalContent = () => {
    if (modalConfig.type === "error") {
      return {
        title: modalConfig.title || "Atenção",
        message: modalConfig.message || "Ocorreu um erro.",
        confirmText: "Entendi",
        isDanger: true,
        showCancel: false
      };
    }

    if (modalConfig.type === "duplicate") {
      return {
        title: "Atenção",
        message: "ID repetido para esta categoria. Verifique o número digitado.",
        confirmText: "Concluir",
        isDanger: false,
        showCancel: false
      };
    }

    if (modalConfig.type === "delete-stock") {
      return {
        title: "Excluir item do estoque",
        message:
          "Tem certeza que deseja excluir este item do estoque? Esta ação não pode ser desfeita.",
        confirmText: "Excluir",
        isDanger: true,
        showCancel: true
      };
    }

    if (modalConfig.type === "trash" || modalConfig.type === "bulk-trash") {
      return {
        title: "Mover para Lixeira",
        message: `Tem certeza que deseja mover ${
          modalConfig.type === "bulk-trash" ? "os itens selecionados" : "este item"
        } para a lixeira?`,
        confirmText: "Mover",
        isDanger: true,
        showCancel: true
      };
    }

    return {
      title: "Excluir Permanentemente",
      message: "Esta ação é irreversível. O item será apagado para sempre do sistema.",
      confirmText: "Excluir",
      isDanger: true,
      showCancel: true
    };
  };

  const modalContent = getModalContent();

  const renderSidebar = () => (
    <aside
      ref={sidebarRef}
      className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-[#e6d0d4] bg-[#fae8eb] shadow-2xl transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex items-center justify-center border-b border-[#e6d0d4]/50 p-8">
        <button
          onClick={() => setActiveMenu("inicio")}
          className="font-serif text-4xl font-medium tracking-[0.2em] text-[#5c3a3a] transition-opacity hover:opacity-80 focus:outline-none"
        >
          IOLLA
        </button>
      </div>

      <nav className="sidebar-nav-container flex flex-1 flex-col overflow-y-auto px-4 py-8">
        <div className="space-y-2">
          <button
            onClick={() => {
              setActiveMenu("pedidos");
              setCurrentView("list");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ${
              activeMenu === "pedidos"
                ? "bg-white text-[#5c3a3a] shadow-sm shadow-[#e6d0d4]"
                : "text-[#8a6a6a] hover:bg-white/50 hover:text-[#5c3a3a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <ShoppingBag size={20} />
              <span className="font-medium">Pedidos</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeMenu === "pedidos"
                  ? "bg-[#fae8eb] text-[#5c3a3a]"
                  : "bg-white text-[#8a6a6a]"
              }`}
            >
              {pedidosCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveMenu("whatsapp");
              setCurrentView("list");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ${
              activeMenu === "whatsapp"
                ? "bg-white text-[#5c3a3a] shadow-sm shadow-[#e6d0d4]"
                : "text-[#8a6a6a] hover:bg-white/50 hover:text-[#5c3a3a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <MessageCircle size={20} />
              <span className="font-medium">WhatsApp</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeMenu === "whatsapp"
                  ? "bg-[#fae8eb] text-[#5c3a3a]"
                  : "bg-white text-[#8a6a6a]"
              }`}
            >
              {whatsappCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveMenu("troca");
              setCurrentView("list");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ${
              activeMenu === "troca"
                ? "bg-white text-[#5c3a3a] shadow-sm shadow-[#e6d0d4]"
                : "text-[#8a6a6a] hover:bg-white/50 hover:text-[#5c3a3a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <RefreshCw size={20} />
              <span className="font-medium">Trocas</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeMenu === "troca"
                  ? "bg-[#fae8eb] text-[#5c3a3a]"
                  : "bg-white text-[#8a6a6a]"
              }`}
            >
              {trocaCount}
            </span>
          </button>

          <button
            onClick={() => {
              setActiveMenu("estoque");
              setCurrentView("list");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ${
              activeMenu === "estoque"
                ? "bg-white text-[#5c3a3a] shadow-sm shadow-[#e6d0d4]"
                : "text-[#8a6a6a] hover:bg-white/50 hover:text-[#5c3a3a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Package size={20} />
              <span className="font-medium">Estoque</span>
            </div>
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeMenu === "estoque"
                  ? "bg-[#fae8eb] text-[#5c3a3a]"
                  : "bg-white text-[#8a6a6a]"
              }`}
            >
              {stockCount}
            </span>
          </button>
        </div>

        <div className="mt-auto pt-6">
          <div className="mb-4 border-t border-[#e6d0d4]/80" />
          <button
            onClick={() => {
              setActiveMenu("lixeira");
              setCurrentView("list");
            }}
            className={`flex w-full items-center justify-between rounded-lg px-4 py-3 transition-all duration-300 ${
              activeMenu === "lixeira"
                ? "bg-white text-[#5c3a3a] shadow-sm shadow-[#e6d0d4]"
                : "text-[#8a6a6a] hover:bg-white/50 hover:text-[#5c3a3a]"
            }`}
          >
            <div className="flex items-center gap-3">
              <Trash2 size={20} />
              <span className="font-medium">Lixeira</span>
            </div>
            {deletedOrdersCount > 0 && (
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                  activeMenu === "lixeira"
                    ? "bg-[#fae8eb] text-[#5c3a3a]"
                    : "bg-white text-[#8a6a6a]"
                }`}
              >
                {deletedOrdersCount}
              </span>
            )}
          </button>
        </div>
      </nav>
    </aside>
  );

  const renderHome = () => (
    <div className="relative flex h-full flex-col items-center justify-center overflow-hidden bg-[#fff5f7] p-8">
      <Flower className="left-10 top-10 opacity-40" size={150} color="#f0dadd" rotation={15} />
      <Flower
        className="bottom-20 right-10 opacity-30"
        size={200}
        color="#f0dadd"
        rotation={-20}
      />
      <Flower className="right-20 top-1/4 opacity-20" size={100} color="#e6d0d4" rotation={45} />
      <Flower
        className="bottom-10 left-1/4 opacity-25"
        size={120}
        color="#e6d0d4"
        rotation={-10}
      />
      <div className="relative z-10 max-w-4xl space-y-6 text-center animate-in zoom-in duration-1000">
        <h1 className="font-serif text-5xl leading-tight text-[#5c3a3a] md:text-7xl">
          Iolla Biquínis
        </h1>
        <p className="text-xl font-light italic tracking-wide text-[#8a6a6a] md:text-3xl">
          a moda que inspira você
        </p>
        <div className="mx-auto mt-8 h-1 w-24 rounded-full bg-[#e6d0d4]" />
      </div>
    </div>
  );

  const renderOrderList = () => (
    <div
      className={`relative space-y-6 animate-in fade-in duration-500 ${
        selectedIds.length > 0 ? "pb-32" : ""
      }`}
    >
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="font-serif text-3xl text-[#5c3a3a]">{getMenuTitle()}</h1>
          <p className="mt-1 text-[#8a6a6a]">
            {activeMenu === "lixeira"
              ? "Visualize e restaure registros excluídos."
              : "Visualize e filtre seus registros."}
          </p>
        </div>
        {activeMenu !== "lixeira" && (
          <Button onClick={handleCreateNewClick} icon={Plus}>
            {getAddButtonText()}
          </Button>
        )}
      </div>

      <Card className="border border-[#f0dadd] p-5">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-[#5c3a3a]">
              <Filter size={16} /> Filtros de Pesquisa
            </h3>
            {(filters.id || filters.customer || filters.date || filters.status) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-red-500 hover:text-red-700"
              >
                <X size={12} /> Limpar Filtros
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-5">
            <div className="relative">
              <input
                type="number"
                placeholder="ID (Opcional)"
                className="w-full rounded-lg border border-[#e6d0d4] bg-[#fffbfb] px-3 py-2 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={filters.id}
                onChange={(event) => handleFilterChange("id", event.target.value)}
              />
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Nome do Cliente"
                className="w-full rounded-lg border border-[#e6d0d4] bg-[#fffbfb] px-3 py-2 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={filters.customer}
                onChange={(event) => handleFilterChange("customer", event.target.value)}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a88a8a]"
                size={16}
              />
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-[#e6d0d4] bg-[#fffbfb] px-3 py-2 pr-8 text-sm text-[#5c3a3a] focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={filters.status}
                onChange={(event) => handleFilterChange("status", event.target.value)}
              >
                <option value="">Todos os Status</option>
                <option value="Sem produção">Sem produção</option>
                <option value="Em produção">Em produção</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <ChevronDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a88a8a]"
                size={16}
              />
            </div>
            <div className="relative">
              <input
                type="date"
                className="w-full rounded-lg border border-[#e6d0d4] bg-[#fffbfb] px-3 py-2 pr-4 text-sm text-[#5c3a3a] focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={filters.date}
                onChange={(event) => handleFilterChange("date", event.target.value)}
              />
            </div>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-[#e6d0d4] bg-[#fffbfb] px-3 py-2 pr-8 text-sm text-[#5c3a3a] focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={sortOption}
                onChange={(event) => setSortOption(event.target.value)}
              >
                <option value="id_desc">Padrão</option>
                <option value="date_asc">Data (Crescente)</option>
                <option value="id_asc">ID (Crescente)</option>
              </select>
              <ArrowUpDown
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a88a8a]"
                size={16}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden border border-[#f0dadd]">
        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-[#e6d0d4] bg-[#fae8eb] text-sm font-semibold text-[#5c3a3a]">
                <th className="w-10 px-6 py-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#5c3a3a] focus:ring-[#5c3a3a]"
                      checked={
                        filteredOrders.length > 0 && selectedIds.length === filteredOrders.length
                      }
                      onChange={handleSelectAll}
                    />
                  </div>
                </th>
                <th className="px-6 py-4">ID</th>
                <th className="px-6 py-4">Cliente</th>
                <th className="px-6 py-4">Data</th>
                <th className="px-6 py-4">Envio</th>
                <th className="w-24 px-6 py-4">Obs.</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f5eced]">
              {filteredOrders.length > 0 ? (
                filteredOrders.map((order) => (
                  <tr
                    key={order.firestoreId}
                    className={`group transition-colors ${
                      selectedIds.includes(order.firestoreId)
                        ? "bg-[#fff0f2]"
                        : "hover:bg-[#fffbfb]"
                    }`}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          className="h-4 w-4 rounded border-gray-300 text-[#5c3a3a] focus:ring-[#5c3a3a]"
                          checked={selectedIds.includes(order.firestoreId)}
                          onChange={() => handleSelectOrder(order.firestoreId)}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#5c3a3a]">
                      {order.id !== "" ? `#${order.id}` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <span className="text-gray-700">{order.customer}</span>
                        <div className="flex flex-wrap gap-1">
                          {order.isGift && (
                            <span className="inline-flex w-fit items-center rounded border border-pink-200 bg-pink-100 px-2 py-0.5 text-[10px] font-medium text-pink-800">
                              <Gift size={10} className="mr-1" /> Brinde
                            </span>
                          )}
                          {activeMenu === "lixeira" && (
                            <span className="inline-flex w-fit items-center rounded border border-gray-200 bg-gray-100 px-2 py-0.5 text-[10px] font-medium uppercase text-gray-800">
                              {order.category}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">{formatDate(order.date)}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Truck size={14} className="text-[#a88a8a]" />
                        {order.shippingMethod}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="max-w-[80px] truncate text-xs text-gray-500"
                          title={order.observation}
                        >
                          {order.observation}
                        </span>
                        {order.observation && (
                          <button
                            onClick={() =>
                              setObsModal({ isOpen: true, text: order.observation })
                            }
                            className="flex-shrink-0 rounded-full p-1 text-[#5c3a3a] transition-colors hover:bg-[#fae8eb]"
                            title="Ver observação completa"
                          >
                            <ChevronDown size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <StatusSelect
                        currentStatus={order.status}
                        onChange={(value) => handleQuickStatusChange(order.firestoreId, value)}
                        disabled={activeMenu === "lixeira"}
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {activeMenu !== "lixeira" ? (
                          <>
                            <button
                              onClick={() => handleEditClick(order)}
                              className="rounded-lg p-2 text-[#5c3a3a] transition-colors hover:bg-[#e6d0d4]"
                              title="Editar"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => requestMoveToTrash(order.firestoreId)}
                              className="rounded-lg p-2 text-[#a88a8a] transition-colors hover:bg-red-50 hover:text-red-500"
                              title="Mover para Lixeira"
                            >
                              <Trash2 size={18} />
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleRestoreOrder(order.firestoreId)}
                              className="ml-0 flex items-center gap-1 rounded-lg p-2 text-sm font-medium text-[#5c3a3a] transition-colors hover:bg-green-50 hover:text-green-600"
                              title="Restaurar"
                            >
                              <RotateCcw size={18} /> Restaurar
                            </button>
                            <button
                              onClick={() => requestPermanentDelete(order.firestoreId)}
                              className="ml-2 rounded-lg p-2 text-[#a88a8a] transition-colors hover:bg-red-50 hover:text-red-600"
                              title="Excluir Permanentemente"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500">
                    {activeMenu === "lixeira"
                      ? "A lixeira está vazia."
                      : "Nenhum registro encontrado."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 z-40 flex -translate-x-1/2 items-center gap-6 rounded-2xl border border-[#e6d0d4] bg-white p-4 shadow-xl animate-in slide-in-from-bottom-10 duration-300">
          <div className="flex items-center gap-2 border-r border-[#e6d0d4] pr-6 font-medium text-[#5c3a3a]">
            <CheckSquare size={20} />
            <span>{selectedIds.length} selecionado(s)</span>
          </div>
          <div className="flex items-center gap-3">
            {activeMenu !== "lixeira" ? (
              <>
                <div className="relative">
                  <select
                    className="cursor-pointer appearance-none rounded-lg bg-[#fae8eb] py-2 pl-4 pr-8 text-sm font-medium text-[#5c3a3a] transition-colors hover:bg-[#f0dadd] focus:outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
                    onChange={(event) => handleBulkStatusChange(event.target.value)}
                    defaultValue=""
                  >
                    <option value="" disabled>
                      Alterar Status
                    </option>
                    <option value="Sem produção">Sem produção</option>
                    <option value="Em produção">Em produção</option>
                    <option value="Finalizado">Finalizado</option>
                  </select>
                  <ChevronDown
                    className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-[#5c3a3a]"
                    size={16}
                  />
                </div>
                <button
                  onClick={requestBulkMoveToTrash}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <Trash2 size={18} /> Mover para Lixeira
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={handleBulkRestore}
                  className="flex items-center gap-2 rounded-lg bg-green-50 px-4 py-2 text-sm font-medium text-green-700 transition-colors hover:bg-green-100"
                >
                  <RotateCcw size={18} /> Restaurar Todos
                </button>
                <button
                  onClick={requestBulkPermanentDelete}
                  className="flex items-center gap-2 rounded-lg bg-red-50 px-4 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-100"
                >
                  <XCircle size={18} /> Excluir Definitivamente
                </button>
              </>
            )}
          </div>
          <button
            onClick={() => setSelectedIds([])}
            className="rounded-full p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>
      )}
    </div>
  );

  const renderStockList = () => {
    const currentTabItems = activeStockTab
      ? stockItems.filter((item) => item.tabId === activeStockTab)
      : [];

    return (
      <div className="relative space-y-6 animate-in fade-in duration-500">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <h1 className="font-serif text-3xl text-[#5c3a3a]">Controle de Estoque</h1>
            <p className="mt-1 text-[#8a6a6a]">
              Visualize os itens e ajuste a quantidade disponível.
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => openStockTabModal()} icon={Plus} variant="secondary">
              Nova Aba
            </Button>
            <Button onClick={openStockFormModal} icon={Plus}>
              Cadastrar Estoque
            </Button>
          </div>
        </div>

        {stockTabs.length === 0 ? (
          <Card className="border border-[#f0dadd] p-10 text-center">
            <div className="mx-auto mb-3 w-fit rounded-full bg-[#fae8eb] p-4 text-[#5c3a3a]">
              <Package size={24} />
            </div>
            <h3 className="text-lg font-semibold text-[#5c3a3a]">Nenhuma aba criada</h3>
            <p className="mt-1 text-sm text-[#8a6a6a]">
              Clique em <strong>Nova Aba</strong> para começar a organizar seu estoque.
            </p>
          </Card>
        ) : (
          <>
            <Card className="border border-[#f0dadd] p-4">
              <div className="flex flex-wrap gap-2">
                {stockTabs.map((tab) => (
                  <div
                    key={tab.firestoreId}
                    className={`group relative inline-flex items-center rounded-full px-4 py-2 text-sm font-medium transition-all ${
                      activeStockTab === tab.firestoreId
                        ? "ring-2 ring-[#5c3a3a] ring-offset-2"
                        : ""
                    }`}
                    style={{ backgroundColor: tab.color }}
                  >
                    <button
                      onClick={() => setActiveStockTab(tab.firestoreId)}
                      className="text-[#5c3a3a] outline-none transition-opacity hover:opacity-80"
                    >
                      {tab.name}
                    </button>
                    <button
                      onClick={() => openStockTabModal(tab)}
                      className="ml-2 opacity-0 transition-all group-hover:opacity-100"
                      title="Editar aba"
                    >
                      <Edit size={14} className="text-[#5c3a3a]" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            {currentTabItems.length === 0 ? (
              <Card className="border border-[#f0dadd] p-10 text-center">
                <div className="mx-auto mb-3 w-fit rounded-full bg-[#fae8eb] p-4 text-[#5c3a3a]">
                  <Package size={24} />
                </div>
                <h3 className="text-lg font-semibold text-[#5c3a3a]">Nenhum item nesta aba</h3>
                <p className="mt-1 text-sm text-[#8a6a6a]">
                  Clique em <strong>Cadastrar Estoque</strong> para adicionar itens a esta aba.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {currentTabItems.map((item) => (
                  <div key={item.firestoreId} className="overflow-hidden rounded-xl border shadow-md transition-transform hover:scale-105" style={{ borderColor: item.cardColor, backgroundColor: `${item.cardColor}15` }}>
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <h3 className="text-lg font-semibold text-[#5c3a3a]">{item.model || "-"}</h3>
                          <p className="mt-1 text-sm text-[#8a6a6a]">
                            {item.color || "-"} • Tam {item.size || "-"}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            item.quantity > 0
                              ? "border border-green-200 bg-green-50 text-green-700"
                              : "border border-red-200 bg-red-50 text-red-700"
                          }`}
                        >
                          {item.quantity} un.
                        </span>
                      </div>

                      <div className="mt-4 grid grid-cols-3 gap-3 rounded-lg border border-[#f5eced] bg-[#fffafb] p-3 text-sm">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#a88a8a]">Modelo</p>
                          <p className="font-medium text-[#5c3a3a]">{item.model || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#a88a8a]">Cor</p>
                          <p className="font-medium text-[#5c3a3a]">{item.color || "-"}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-[#a88a8a]">Tamanho</p>
                          <p className="font-medium text-[#5c3a3a]">{item.size || "-"}</p>
                        </div>
                      </div>

                      <div className="mt-5 flex justify-end">
                        <Button
                          variant="secondary"
                          icon={Edit}
                          onClick={() => openStockEditModal(item)}
                          className="px-3 py-2 text-sm"
                        >
                          Editar
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    );
  };

  const renderCreateOrder = () => (
    <div className="mx-auto max-w-2xl space-y-6 animate-in slide-in-from-right duration-300">
      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentView("list")}
          className="rounded-lg p-2 text-[#8a6a6a] transition-colors hover:bg-[#fae8eb] hover:text-[#5c3a3a]"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h1 className="font-serif text-3xl font-bold text-[#5c3a3a]">{formTitle}</h1>
          <p className="mt-1 text-[#8a6a6a]">
            {editingId ? "Gerencie os detalhes do registro." : "Preencha os dados abaixo."}
          </p>
        </div>
      </div>

      <Card className="border-[#f0dadd] p-8">
        <h3 className="mb-6 flex items-center gap-2 border-b border-[#e6d0d4] pb-4 text-lg font-semibold text-[#5c3a3a]">
          <User size={20} className="text-[#5c3a3a]" /> Dados
        </h3>
        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">
              {newOrder.category === "pedidos" ? "ID Pedido" : "ID (Opcional)"}
            </label>
            <input
              type="number"
              className="w-full rounded-lg border border-[#e6d0d4] bg-white p-3 font-medium text-[#5c3a3a] outline-none focus:ring-2 focus:ring-[#5c3a3a]/20"
              value={newOrder.id}
              onChange={(event) => setNewOrder({ ...newOrder, id: event.target.value })}
              placeholder={
                newOrder.category === "pedidos"
                  ? "Digite o ID do pedido"
                  : "Pode deixar em branco"
              }
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Nome</label>
            <input
              type="text"
              placeholder="Nome completo..."
              className="w-full rounded-lg border border-[#e6d0d4] p-3 outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              value={newOrder.customer}
              onChange={(event) => setNewOrder({ ...newOrder, customer: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Data</label>
            <input
              type="date"
              className="w-full rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
              value={newOrder.date}
              onChange={(event) => setNewOrder({ ...newOrder, date: event.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">
              Método de Envio
            </label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-[#e6d0d4] bg-white p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={newOrder.shippingMethod}
                onChange={(event) =>
                  setNewOrder({ ...newOrder, shippingMethod: event.target.value })
                }
              >
                <option value="Sedex">Sedex</option>
                <option value="Loggi">Loggi</option>
                <option value="Joinville">Joinville</option>
                <option value="Sedex viagem">Sedex viagem</option>
                <option value="Loggi viagem">Loggi viagem</option>
                <option value="Sedex Urgente">Sedex Urgente</option>
                <option value="Loggi Urgente">Loggi Urgente</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-4 text-[#a88a8a]"
                size={16}
              />
            </div>
          </div>
          <div>
            <label className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50">
              <div
                className={`flex h-5 w-5 items-center justify-center rounded border-2 transition-colors ${
                  newOrder.isGift
                    ? "border-[#5c3a3a] bg-[#5c3a3a]"
                    : "border-gray-300 group-hover:border-[#5c3a3a]"
                }`}
              >
                {newOrder.isGift && <CheckSquare size={14} className="text-white" />}
              </div>
              <input
                type="checkbox"
                className="hidden"
                checked={newOrder.isGift}
                onChange={(event) => setNewOrder({ ...newOrder, isGift: event.target.checked })}
              />
              <span className="text-sm font-medium text-[#8a6a6a] transition-colors group-hover:text-[#5c3a3a]">
                Este registro tem brinde ?
              </span>
            </label>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Status</label>
            <div className="relative">
              <select
                className="w-full appearance-none rounded-lg border border-[#e6d0d4] bg-white p-3 text-[#5c3a3a] outline-none transition-all focus:ring-2 focus:ring-[#5c3a3a]/20"
                value={newOrder.status}
                onChange={(event) => setNewOrder({ ...newOrder, status: event.target.value })}
              >
                <option value="Sem produção">Sem produção</option>
                <option value="Em produção">Em produção</option>
                <option value="Finalizado">Finalizado</option>
              </select>
              <ChevronDown
                className="pointer-events-none absolute right-3 top-4 text-[#a88a8a]"
                size={16}
              />
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-[#8a6a6a]">Observação</label>
            <textarea
              className="min-h-[100px] w-full resize-y rounded-lg border border-[#e6d0d4] p-3 text-[#5c3a3a] outline-none transition-all placeholder:text-[#a88a8a] focus:ring-2 focus:ring-[#5c3a3a]/20"
              placeholder="Adicione observações..."
              value={newOrder.observation}
              onChange={(event) =>
                setNewOrder({ ...newOrder, observation: event.target.value })
              }
            />
          </div>
          <div className="pt-4">
            <Button
              onClick={handleSaveOrder}
              className="w-full py-3 text-lg shadow-md shadow-[#e6d0d4]"
            >
              {editingId ? "Salvar Alterações" : "Salvar Registro"}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="relative flex h-screen overflow-hidden bg-gray-50 font-sans text-[#4a2c2c]">
      <button
        ref={sidebarToggleButtonRef}
        onClick={(event) => {
          event.stopPropagation();
          setIsSidebarOpen((previous) => !previous);
        }}
        className={`fixed top-4 z-50 rounded-r-xl border border-[#e6d0d4] border-l-0 bg-[#fae8eb] p-2 text-[#5c3a3a] shadow-md transition-all duration-300 ease-in-out hover:bg-[#f0dadd] ${
          isSidebarOpen ? "left-64" : "left-0"
        }`}
        title="Alternar Menu"
      >
        {isSidebarOpen ? <ChevronLeft size={24} /> : <ChevronRight size={24} />}
      </button>

      {renderSidebar()}

      <main className="h-full w-full flex-1 overflow-y-auto">
        <header className="sticky top-0 z-10 flex min-h-16 items-center justify-between border-b border-[#f3e6e8] bg-white px-8 py-3">
          <div
            className={`flex items-center gap-2 text-sm text-[#a88a8a] transition-all duration-300 ${
              isSidebarOpen ? "ml-0" : "ml-10"
            }`}
          >
            <button
              onClick={() => setActiveMenu("inicio")}
              className="transition-colors hover:text-[#5c3a3a]"
            >
              Início
            </button>
            <span>/</span>
            <span className="font-medium capitalize text-[#5c3a3a]">{activeMenu}</span>
          </div>
          <div className="flex items-center gap-3">
            {updateStatus.version && (
              <span className="hidden rounded-full border border-[#f0dadd] bg-[#fff9fa] px-3 py-1 text-xs font-medium text-[#8a6a6a] md:inline-flex">
                v{updateStatus.version}
              </span>
            )}
            <div
              className={`hidden max-w-[360px] items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium xl:flex ${getUpdateBadgeClassName(
                updateStatus.state
              )}`}
              title={updateStatus.releaseNotes || updateStatus.message}
            >
              <span className="truncate">
                {updateStatus.availableVersion
                  ? `Nova versão ${updateStatus.availableVersion}`
                  : "Atualizações"}
              </span>
              <span className="opacity-50">•</span>
              <span className="truncate">{updateStatus.message}</span>
            </div>
            {hasReleaseNotes && (
              <Button
                variant="ghost"
                onClick={() => setIsReleaseNotesOpen(true)}
                icon={MessageSquare}
                className="px-3 py-2 text-sm"
              >
                Ver novidades
              </Button>
            )}
            <Button
              variant={canInstallUpdate ? "primary" : "secondary"}
              onClick={handleUpdateButtonClick}
              disabled={updateButtonDisabled}
              icon={canInstallUpdate ? RotateCcw : RefreshCw}
              className="px-3 py-2 text-sm"
            >
              {getUpdateButtonLabel(updateStatus)}
            </Button>
          </div>
        </header>

        {activeMenu === "inicio" ? (
          renderHome()
        ) : activeMenu === "estoque" ? (
          <div className="mx-auto max-w-7xl p-8">{renderStockList()}</div>
        ) : (
          <div className="mx-auto max-w-7xl p-8">
            {currentView === "list" ? renderOrderList() : renderCreateOrder()}
          </div>
        )}
      </main>

      <ConfirmationModal
        isOpen={modalConfig.isOpen}
        onClose={() => setModalConfig({ ...modalConfig, isOpen: false })}
        onConfirm={executeModalAction}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        isDanger={modalContent.isDanger}
        showCancel={modalContent.showCancel}
      />

      <ObservationModal
        isOpen={obsModal.isOpen}
        onClose={() => setObsModal({ ...obsModal, isOpen: false })}
        text={obsModal.text}
      />

      <StockFormModal
        isOpen={stockFormModalOpen}
        onClose={closeStockFormModal}
        onSave={handleSaveStockItem}
        formData={stockFormData}
        setFormData={setStockFormData}
      />

      <StockEditModal
        isOpen={stockEditModal.isOpen}
        onClose={closeStockEditModal}
        onSave={handleUpdateStockItem}
        onDelete={() => requestStockDelete(stockEditModal.itemId)}
        editData={stockEditData}
        setEditData={setStockEditData}
      />

      <StockTabModal
        isOpen={stockTabModal.isOpen}
        onClose={closeStockTabModal}
        onSave={handleSaveStockTab}
        onDelete={handleDeleteStockTab}
        isEditing={stockTabModal.isEditing}
        formData={stockTabFormData}
        setFormData={setStockTabFormData}
      />

      <ReleaseNotesModal
        isOpen={isReleaseNotesOpen}
        onClose={() => setIsReleaseNotesOpen(false)}
        version={updateStatus.availableVersion}
        releaseDate={updateStatus.releaseDate}
        releaseNotes={updateStatus.releaseNotes}
      />
    </div>
  );
}

export default App;
