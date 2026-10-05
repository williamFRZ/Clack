#pragma once
#include <cstring>

enum class Comando { Ignorar, Abrir, Fechar };
// Nao transforme erro HTTP, HTML, JSON ou resposta desconhecida em movimento.
inline Comando interpretarComando(int httpStatus, const char* resposta) {
  if (httpStatus != 200 || resposta == nullptr) return Comando::Ignorar;
  if (std::strcmp(resposta, "abrir") == 0) return Comando::Abrir;
  if (std::strcmp(resposta, "fechar") == 0) return Comando::Fechar;
  return Comando::Ignorar;
}
