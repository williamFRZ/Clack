#pragma once

#include <stdint.h>
#include <string.h>

// Confirma uma apresentação contínua da mesma tag. O chamador inicia apenas
// quando a operação exigir confirmação e fornece observações confiáveis do
// leitor. Uma ausência breve tolera perdas de leitura; colisão ou erro de
// comunicação devem chamar cancelar() imediatamente.
enum class ResultadoConfirmacaoTag { Inativa, Aguardando, Confirmada, Cancelada };

class ConfirmacaoTag {
 public:
  static constexpr uint32_t DURACAO_MS = 3000;
  static constexpr uint32_t TOLERANCIA_AUSENCIA_MS = 250;
  static constexpr size_t UID_MAXIMO = 29; // 10 bytes hexadecimais com separadores.

  bool iniciar(const char* uid, uint32_t agora) {
    if (ativa_ || confirmada_ || !uid || !*uid) return false;
    size_t tamanho = strlen(uid);
    if (tamanho > UID_MAXIMO) return false;
    memcpy(uid_, uid, tamanho + 1);
    inicio_ = ultima_leitura_ = agora;
    ativa_ = true;
    return true;
  }

  // uid == nullptr ou "" indica ausência de leitura nesta amostra. Só uma
  // nova leitura válida da mesma tag pode produzir Confirmada, nunca o relógio
  // sozinho. Uma lacuna maior que a tolerância cancela mesmo se a tag voltar.
  ResultadoConfirmacaoTag observar(const char* uid, uint32_t agora) {
    if (!ativa_) return ResultadoConfirmacaoTag::Inativa;
    if (static_cast<uint32_t>(agora - ultima_leitura_) > TOLERANCIA_AUSENCIA_MS)
      return cancelar();
    if (!uid || !*uid) return ResultadoConfirmacaoTag::Aguardando;
    if (strcmp(uid_, uid) != 0) return cancelar();
    ultima_leitura_ = agora;
    if (static_cast<uint32_t>(agora - inicio_) < DURACAO_MS)
      return ResultadoConfirmacaoTag::Aguardando;
    ativa_ = false;
    confirmada_ = true;
    return ResultadoConfirmacaoTag::Confirmada;
  }

  ResultadoConfirmacaoTag cancelar() {
    if (!ativa_) return ResultadoConfirmacaoTag::Inativa;
    ativa_ = false;
    uid_[0] = '\0';
    return ResultadoConfirmacaoTag::Cancelada;
  }

  bool ativa() const { return ativa_; }
  bool confirmada() const { return confirmada_; }

  // Depois de confirmada, o chamador só deve liberar após verificar que a tag
  // foi realmente retirada. Assim, uma permanência não confirma duas vezes.
  void liberarAposRetirada() {
    ativa_ = false;
    confirmada_ = false;
    uid_[0] = '\0';
  }

 private:
  char uid_[UID_MAXIMO + 1] = {};
  uint32_t inicio_ = 0;
  uint32_t ultima_leitura_ = 0;
  bool ativa_ = false;
  bool confirmada_ = false;
};

// A retirada só é considerada observada quando o RC522 relata ausência em
// amostras contínuas. Nenhum erro, colisão ou período cego comprova retirada.
enum class AmostraRetiradaTag { Timeout, Presente, Colisao, Erro, UidIlegivel };

class ConfirmacaoRetiradaTag {
 public:
  static constexpr uint32_t DURACAO_MS = 700;
  static constexpr uint32_t INTERVALO_MAXIMO_MS = 250;
  static constexpr uint32_t LIMITE_TENTATIVA_MS = 1500;
  bool emAndamento() const { return ativa_; }

  // Retorna true uma única vez por sequência de ausência comprovada. Uma
  // amostra que não seja Timeout reinicia a sequência e permite novo aviso.
  bool observar(AmostraRetiradaTag amostra, uint32_t agora) {
    if (amostra != AmostraRetiradaTag::Timeout) {
      reiniciar();
      return false;
    }
    if (notificada_) return false;
    if (!ativa_) {
      inicio_tentativa_ = inicio_ = ultima_amostra_ = agora;
      ativa_ = true;
      return false;
    }
    // Uma leitura defeituosa não pode impedir a sincronização para sempre.
    if (static_cast<uint32_t>(agora - inicio_tentativa_) >= LIMITE_TENTATIVA_MS) {
      reiniciar();
      return false;
    }
    if (static_cast<uint32_t>(agora - ultima_amostra_) > INTERVALO_MAXIMO_MS) {
      inicio_ = ultima_amostra_ = agora;
      return false;
    }
    ultima_amostra_ = agora;
    if (static_cast<uint32_t>(agora - inicio_) < DURACAO_MS) return false;
    ativa_ = false;
    notificada_ = true;
    return true;
  }

  void reiniciar() {
    ativa_ = false;
    notificada_ = false;
  }

 private:
  uint32_t inicio_ = 0;
  uint32_t inicio_tentativa_ = 0;
  uint32_t ultima_amostra_ = 0;
  bool ativa_ = false;
  bool notificada_ = false;
};
