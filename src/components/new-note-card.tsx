import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { ChangeEvent, FormEvent, useState } from "react";
import { toast } from "sonner";

interface NewNoteCardProps {
  onNoteCreated: (content: string) => void;
}
let SpeechRecognition: SpeechRecognition | null = null
export function NewNoteCard({ onNoteCreated }: NewNoteCardProps) {
  const [shouldShowOnboarding, setShouldShowOnboarding] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [content, setContent] = useState("");

  function handleStartEditor() {
    setShouldShowOnboarding(false);
  }

  function handleContentChanged(evento: ChangeEvent<HTMLTextAreaElement>) {
    setContent(evento.target.value);
    if (evento.target.value === "") {
      setShouldShowOnboarding(true);
    }
  }

  function handleSaveNote(event: FormEvent) {
    event.preventDefault();
    if (content === "") {
      return;
    }
    onNoteCreated(content);
    setContent("");
    setShouldShowOnboarding(true);
    toast.success("Nota criada com sucesso!");
  }
  function handleStartRecording() {
    const isSpeechRecognitionAPIAvailable =
      "SpeechRecognition" in window || "webkitSpeechRecognition" in window;
    if (!isSpeechRecognitionAPIAvailable) {
      alert(
        "Infeliz seu navegador NÃO suporta a api de gravação, você pode testar em outro se assim desejar!"
      );
      return;
    }
    setIsRecording(true);
    setShouldShowOnboarding(false);
    const SpeechRecognitionAPI =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    SpeechRecognition = new SpeechRecognitionAPI();
    SpeechRecognition.lang = "pt-BR";
    SpeechRecognition.continuous = true;
    SpeechRecognition.maxAlternatives = 1;
    SpeechRecognition.interimResults = true;
    SpeechRecognition.onresult = (event) => {
      const transcription = Array.from(event.results).reduce((text, result) => {
        return text.concat(result[0].transcript);
      }, "");
      setContent(transcription);
    };
    SpeechRecognition.onerror = (event: any) => {
      console.log(event);
    };
    SpeechRecognition.start();
  }

  function handleStopRecording() {
    setIsRecording(false);
   if (SpeechRecognition !== null) {
    SpeechRecognition.stop() 
   }
  }

  return (
    <Dialog.Root>
      <Dialog.Trigger className="rounded-md flex flex-col bg-slate-700 text-left p-5 gap-3 hover:ring-2 outline-none hover:ring-slate-600 focus-visible:ring-2 focus-visible:ring-lime-400">
        <span className="text-sm font-medium text-slate-200 ">
          Adicionar nota
        </span>
        <p className="text-sm leading-6 text-slate-400">
          Adicione uma nota em áudio e será convertida para texto
          automaticamente
        </p>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/60" />
        <Dialog.Content className="fixed overflow-hidden inset-0 md:inset-auto md:left-1/2 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 md:max-w-[640px] w-full md:h-[60vh] bg-slate-700 md:rounded-md flex flex-col outline-none">
          <Dialog.Close className="absolute right-0 top-0 bg-slate-900 p-1.5 text-slate-600 hover:text-slate-300">
            <svg className="size-5">
              <X />
            </svg>
          </Dialog.Close>

          <form className="flex-1 flex flex-col">
            <div className="flex flex-1 flex-col gap-3 p-5">
              <span className="text-sm font-medium text-slate-300"></span>
              {shouldShowOnboarding ? (
                <p className="text-sm leading-6 text-slate-400">
                  <button
                    type="button"
                    onClick={handleStartRecording}
                    className="font-medium text-lime-300 hover:underline"
                  >
                    Grave uma nota
                  </button>{" "}
                  em áudio, ou se preferir{" "}
                  <button
                    type="button"
                    onClick={handleStartEditor}
                    className="font-medium text-lime-300 hover:underline"
                  >
                    use apenas texto
                  </button>
                </p>
              ) : (
                <textarea
                  autoFocus
                  className="text-sm leading-6 text-slate-400 bg-transparent resize-none flex-1 outline-none"
                  onChange={handleContentChanged}
                  value={content}
                />
              )}
            </div>
            {isRecording ? (
              <button
                type="button"
                onClick={handleStopRecording}
                className="w-full flex items-center justify-center gap-2 bg-slate-900 py-4 text-center text-sm text-slate-300 outline-none font-medium hover:bg-slate-100"
              >
                <div className="size-3 rounded-full bg-red-600 animate-pulse"></div>
                Gravando ! (Click para interromper)
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSaveNote}
                className="w-full bg-lime-500 py-4 text-center text-sm text-lime-950 outline-none font-medium hover:bg-lime-600"
              >
                Salvar nota
              </button>
            )}
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
