#pragma once
#include <string.h>

enum class PosicaoAoReiniciar { NaoMover, Aberta, Fechada };

// O estado é lógico: não há sensor que confirme a posição física do ferrolho.
inline PosicaoAoReiniciar posicaoAoReiniciar(int modo, bool memoriaOk,
                                             bool movimentoPendente, const char* estado) {
 if(modo!=0 || !memoriaOk || movimentoPendente || estado==nullptr)
  return PosicaoAoReiniciar::NaoMover;
 if(!strcmp(estado,"em_uso")) return PosicaoAoReiniciar::Aberta;
 if(!strcmp(estado,"disponivel") || !strcmp(estado,"manutencao"))
  return PosicaoAoReiniciar::Fechada;
 return PosicaoAoReiniciar::NaoMover;
}
